import { Component, input } from '@angular/core';
import { AdditionalCharge, FixedCharge, PercentageCharge, StitchFormulaCharge, ColorFormulaCharge, SizeTieredCharge, SizePercentageTiersCharge } from '../pricing.types';

@Component({
  selector: 'app-additional-charges',
  standalone: true,
  template: `
    <div class="charges-card">
      <div class="charges-header">
        <h3>{{ title() }}</h3>
      </div>
      <div class="charges-list">
        @for (charge of charges(); track charge.key) {
          <div class="charge-item">
            <div class="charge-name">{{ charge.name.replace('_', ' ') }}</div>
            <div class="charge-value">
              @switch (charge.type) {
                @case ('fixed') {
                  $<input type="number" [value]="asFixed(charge).value()" (change)="updateFixed(charge, $event)" class="inline-input" />
                }
                @case ('percentage') {
                  <input type="number" [value]="asPercentage(charge).value()" (change)="updatePercentage(charge, $event)" class="inline-input" />%
                }
                @case ('stitch-formula') {
                  $ <input type="number" [value]="asStitch(charge).price()" (change)="updateSignal(asStitch(charge).price, $event)" class="inline-input w-20" /> 
                  over <input type="number" [value]="asStitch(charge).over()" (change)="updateSignal(asStitch(charge).over, $event)" class="inline-input w-24" />
                  every <input type="number" [value]="asStitch(charge).every()" (change)="updateSignal(asStitch(charge).every, $event)" class="inline-input w-24" />
                }
                @case ('color-formula') {
                  $ <input type="number" [value]="asColor(charge).price()" (change)="updateSignal(asColor(charge).price, $event)" class="inline-input w-20" /> 
                  over <input type="number" [value]="asColor(charge).over()" (change)="updateSignal(asColor(charge).over, $event)" class="inline-input w-24" /> colors
                }
                @case ('size-tiered') {
                  <div class="tiered-grid">
                    @for (tier of asSizeTiered(charge).sizeTiers; track $index) {
                      <div class="tier-col">
                        <div class="tier-label">Size {{ tier }}</div>
                        <input type="number" [value]="asSizeTiered(charge).prices[$index]()" (change)="updateSignal(asSizeTiered(charge).prices[$index], $event)" class="inline-input w-full" />
                      </div>
                    }
                  </div>
                }
                @case ('size-percentage-tiers') {
                  <div class="tiered-grid">
                    @for (tier of asSizePercentage(charge).sizeTiers; track $index) {
                      <div class="tier-col">
                        <div class="tier-label">Size {{ tier }}</div>
                        <input type="text" [value]="asSizePercentage(charge).percentages[$index]()" (change)="updateSignalCell(asSizePercentage(charge).percentages[$index], $event)" class="inline-input w-full" />
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .charges-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }
    .charges-header {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      border-radius: 0.75rem 0.75rem 0 0;
    }
    .charges-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }
    .charges-list {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .charge-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    .charge-name {
      font-weight: 500;
      color: #334155;
      text-transform: capitalize;
    }
    .inline-input {
      padding: 0.375rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.25rem;
      text-align: right;
      width: 80px;
    }
    .inline-input:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .w-20 { width: 5rem; }
    .w-24 { width: 6rem; }
    .w-full { width: 100%; text-align: center; }
    .tiered-grid {
      display: flex;
      gap: 0.5rem;
    }
    .tier-col {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      align-items: center;
    }
    .tier-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }
  `]
})
export class AdditionalChargesComponent {
  title = input.required<string>();
  charges = input.required<AdditionalCharge[]>();

  asFixed(c: AdditionalCharge) { return c as FixedCharge; }
  asPercentage(c: AdditionalCharge) { return c as PercentageCharge; }
  asStitch(c: AdditionalCharge) { return c as StitchFormulaCharge; }
  asColor(c: AdditionalCharge) { return c as ColorFormulaCharge; }
  asSizeTiered(c: AdditionalCharge) { return c as SizeTieredCharge; }
  asSizePercentage(c: AdditionalCharge) { return c as SizePercentageTiersCharge; }

  updateFixed(charge: AdditionalCharge, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.asFixed(charge).value.set(val);
  }

  updatePercentage(charge: AdditionalCharge, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.asPercentage(charge).value.set(val);
  }

  updateSignal(sig: any, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) sig.set(val);
  }

  updateSignalCell(sig: any, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      sig.set(num);
    } else {
      sig.set(val); // fallback for 'quote', etc.
    }
  }
}
