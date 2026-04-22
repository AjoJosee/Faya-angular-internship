import { Component, input, output, computed } from '@angular/core';
import { Cell } from '../pricing.types';

@Component({
  selector: 'app-pricing-cell',
  standalone: true,
  template: `
    @if (cell().editable) {
      <input
        type="number"
        [value]="value()"
        (input)="onInput($event)"
        class="cell-input"
        step="0.01"
      />
    } @else {
      <div class="cell-readonly">{{ value() }}</div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .cell-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: white;
      text-align: right;
      font-size: 0.875rem;
      color: #1e293b;
      transition: all 0.2s;
    }
    .cell-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .cell-readonly {
      padding: 0.5rem;
      text-align: right;
      font-size: 0.875rem;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
    }
  `]
})
export class PricingCellComponent {
  cell = input.required<Cell>();
  
  value = computed(() => this.cell().value());

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      this.cell().value.set(num);
    }
  }
}
