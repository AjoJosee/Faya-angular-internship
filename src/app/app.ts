import { Component, signal } from '@angular/core';
import { PricingContainerComponent } from './pricing/pricing-container/pricing-container.component';

@Component({
  selector: 'app-root',
  imports: [PricingContainerComponent],
  template: `<app-pricing-container></app-pricing-container>`,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dynamic-pricing-ui');
}
