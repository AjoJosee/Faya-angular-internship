import { Component, input, inject, computed } from '@angular/core';
import { PricingSection } from '../pricing.types';
import { PricingRowComponent } from '../pricing-row/pricing-row.component';
import { PricingStateService } from '../pricing-state.service';

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [PricingRowComponent],
  template: `
    <div class="section-card">
      <div class="section-header" (click)="toggleExpanded()">
        <div class="section-title">
          <span class="chevron" [class.expanded]="section().isExpanded()">▼</span>
          <h3>{{ section().name }}</h3>
          <span class="badge">{{ section().type }}</span>
        </div>
        <div class="header-actions" (click)="$event.stopPropagation()">
          <button class="btn-add" (click)="addColumn()">+ Add Tier</button>
        </div>
      </div>

      @if (section().isExpanded()) {
        <div class="section-content">
          <div class="table-container">
            <div class="grid-table" [style.grid-template-columns]="gridColumns()">
              
              <!-- Header Row -->
              <div class="header-cell sticky-left">Tiers</div>
              @for (tier of section().tiers(); track $index) {
                <div class="header-cell tier-cell">
                  <div class="tier-input-wrapper">
                    <input 
                      type="number" 
                      [value]="tier"
                      (change)="updateTier($index, $event)"
                      class="tier-input"
                    />
                    <button class="btn-remove" (click)="removeColumn($index)" title="Remove Tier">×</button>
                  </div>
                </div>
              }

              <!-- Data Rows -->
              @for (row of section().rows(); track $index) {
                <app-pricing-row [row]="row" />
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .section-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-bottom: 1.5rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .section-header {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      cursor: pointer;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }
    .section-header:hover {
      background: #f1f5f9;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .section-title h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }
    .chevron {
      font-size: 0.75rem;
      color: #64748b;
      transition: transform 0.2s;
      transform: rotate(-90deg);
    }
    .chevron.expanded {
      transform: rotate(0);
    }
    .badge {
      background: #e0f2fe;
      color: #0284c7;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .btn-add {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-add:hover {
      background: #2563eb;
    }
    .section-content {
      padding: 0;
      overflow-x: auto;
    }
    .table-container {
      min-width: max-content;
    }
    .grid-table {
      display: grid;
    }
    .header-cell {
      padding: 0.75rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sticky-left {
      position: sticky;
      left: 0;
      z-index: 10;
      justify-content: flex-start;
      border-right: 1px solid #e2e8f0;
    }
    .tier-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .tier-input {
      width: 100%;
      padding: 0.5rem;
      padding-right: 2rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      text-align: center;
      font-weight: 600;
      color: #1e293b;
    }
    .btn-remove {
      position: absolute;
      right: 0.25rem;
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 1.25rem;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
    }
    .btn-remove:hover {
      opacity: 1;
    }
  `]
})
export class PricingSectionComponent {
  section = input.required<PricingSection>();
  private stateService = inject(PricingStateService);

  gridColumns = computed(() => {
    const tiersCount = this.section().tiers().length;
    return `150px repeat(${tiersCount}, minmax(100px, 1fr))`;
  });

  toggleExpanded() {
    this.section().isExpanded.update(v => !v);
  }

  addColumn() {
    this.stateService.addColumn(this.section());
  }

  removeColumn(index: number) {
    this.stateService.removeColumn(this.section(), index);
  }

  updateTier(index: number, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.section().tiers.update(t => {
        const copy = [...t];
        copy[index] = val;
        return copy;
      });
    }
  }
}
