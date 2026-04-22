import { Injectable, signal, effect, inject } from '@angular/core';
import {
  CellValue,
  PricingSection,
  AdditionalCharge,
  SerializedState,
  FixedCharge,
  PercentageCharge,
  SizeTieredCharge,
  StitchFormulaCharge,
  ColorFormulaCharge,
  SizePercentageTiersCharge,
} from './pricing.types';
import { PricingNormalizerService } from './pricing-normalizer.service';

const STORAGE_KEY = 'pricing_ui_state';

@Injectable({ providedIn: 'root' })
export class PricingStateService {
  private normalizer = inject(PricingNormalizerService);

  // ─── Top-level State Signals ──────────────────────────────
  sections = signal<PricingSection[]>([]);
  ruiCharges = signal<AdditionalCharge[]>([]);
  frCharges = signal<AdditionalCharge[]>([]);

  private initialized = false;

  // ─── Undo / Redo State ────────────────────────────────────
  private history: string[] = [];
  private historyIndex = -1;
  canUndo = signal(false);
  canRedo = signal(false);

  constructor() {
    // Auto-save & History tracking
    effect(() => {
      const data = this.serialize();
      if (!this.initialized) return;
      
      const str = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, str);

      // We use untracked so we don't accidentally track historyIndex
      if (this.history[this.historyIndex] !== str) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(str);
        this.historyIndex++;
        this.canUndo.set(this.historyIndex > 0);
        this.canRedo.set(this.historyIndex < this.history.length - 1);
      }
    });
  }

  // ─── Initialize ───────────────────────────────────────────
  initialize(rawJson: any): void {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed: SerializedState = JSON.parse(saved);
        this.loadFromSerialized(parsed);
        this.initialized = true;
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Normalize from raw JSON
    const rui = rawJson.data.embroidered_specials.rui;
    this.sections.set(this.normalizer.normalizeSections(rui));
    this.ruiCharges.set(this.normalizer.normalizeCharges(rui.additional_charge));

    // FR-level additional charges
    const frSection = rui.fr;
    if (frSection?.additional_charge) {
      this.frCharges.set(this.normalizer.normalizeCharges(frSection.additional_charge));
    }

    this.initialized = true;
  }

  // ─── Undo / Redo Actions ──────────────────────────────────
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadFromSerialized(JSON.parse(this.history[this.historyIndex]));
      this.canUndo.set(this.historyIndex > 0);
      this.canRedo.set(this.historyIndex < this.history.length - 1);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadFromSerialized(JSON.parse(this.history[this.historyIndex]));
      this.canUndo.set(this.historyIndex > 0);
      this.canRedo.set(this.historyIndex < this.history.length - 1);
    }
  }

  private loadFromSerialized(parsed: SerializedState) {
    this.sections.set(this.normalizer.rebuildSections(parsed.sections));
    this.ruiCharges.set(this.normalizer.rebuildCharges(parsed.ruiCharges));
    this.frCharges.set(this.normalizer.rebuildCharges(parsed.frCharges));
  }

  // ─── Column Management ────────────────────────────────────
  addColumn(section: PricingSection): void {
    section.tiers.update((t) => [...t, 0]);
    section.rows.update((rs) =>
      rs.map((row) => ({
        ...row,
        prices: [
          ...row.prices,
          { value: signal(0 as CellValue), editable: true },
        ],
      }))
    );
  }

  removeColumn(section: PricingSection, index: number): void {
    if (section.tiers().length <= 1) return;
    section.tiers.update((t) => t.filter((_, idx) => idx !== index));
    section.rows.update((rs) =>
      rs.map((row) => ({
        ...row,
        prices: row.prices.filter((_, idx) => idx !== index),
      }))
    );
  }

  // ─── Serialization ───────────────────────────────────────
  serialize(): SerializedState {
    return {
      sections: this.sections().map((s) => ({
        key: s.key,
        tiers: s.tiers(),
        rows: s.rows().map((row) => ({
          label: row.label,
          prices: row.prices.map((c) => c.value()),
        })),
        discount: s.discount?.(),
      })),
      ruiCharges: this.ruiCharges().map((c) => this.serializeCharge(c)),
      frCharges: this.frCharges().map((c) => this.serializeCharge(c)),
    };
  }

  private serializeCharge(charge: AdditionalCharge): any {
    switch (charge.type) {
      case 'fixed':
        return { key: charge.key, type: charge.type, value: (charge as FixedCharge).value() };
      case 'percentage':
        return { key: charge.key, type: charge.type, value: (charge as PercentageCharge).value() };
      case 'size-tiered': {
        const st = charge as SizeTieredCharge;
        return {
          key: charge.key,
          type: charge.type,
          sizeTiers: st.sizeTiers,
          prices: st.prices.map((p) => p()),
        };
      }
      case 'stitch-formula': {
        const sf = charge as StitchFormulaCharge;
        return {
          key: charge.key,
          type: charge.type,
          over: sf.over(),
          every: sf.every(),
          price: sf.price(),
        };
      }
      case 'color-formula': {
        const cf = charge as ColorFormulaCharge;
        return {
          key: charge.key,
          type: charge.type,
          over: cf.over(),
          price: cf.price(),
        };
      }
      case 'size-percentage-tiers': {
        const sp = charge as SizePercentageTiersCharge;
        return {
          key: charge.key,
          type: charge.type,
          sizeTiers: sp.sizeTiers,
          percentages: sp.percentages.map((p) => p()),
        };
      }
      default: {
        const fallback = charge as any;
        return { key: fallback.key, type: fallback.type };
      }
    }
  }

  clearSavedState(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
