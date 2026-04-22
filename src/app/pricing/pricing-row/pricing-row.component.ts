import { Component, input } from '@angular/core';
import { Row } from '../pricing.types';
import { PricingCellComponent } from '../pricing-cell/pricing-cell.component';

@Component({
  selector: 'app-pricing-row',
  standalone: true,
  imports: [PricingCellComponent],
  template: `
    <div class="row-label">{{ row().label }}</div>
    @for (cell of row().prices; track $index) {
      <div class="row-cell">
        <app-pricing-cell [cell]="cell" />
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
    .row-label {
      padding: 0.75rem;
      font-weight: 500;
      color: #334155;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      position: sticky;
      left: 0;
      z-index: 10;
    }
    .row-cell {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class PricingRowComponent {
  row = input.required<Row>();
}
