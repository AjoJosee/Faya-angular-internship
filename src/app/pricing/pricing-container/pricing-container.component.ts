import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PricingStateService } from '../pricing-state.service';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { AdditionalChargesComponent } from '../additional-charges/additional-charges.component';

@Component({
  selector: 'app-pricing-container',
  standalone: true,
  imports: [PricingSectionComponent, AdditionalChargesComponent],
  template: `
    <div class="container">
      <header class="header">
        <h1>Dynamic Pricing Management</h1>
        <div class="actions">
          <button class="btn-undo" [disabled]="!state.canUndo()" (click)="state.undo()">⟲ Undo</button>
          <button class="btn-redo" [disabled]="!state.canRedo()" (click)="state.redo()">⟳ Redo</button>
          <button class="btn-clear" (click)="clearState()">Reset</button>
          <button class="btn-save" (click)="save()">Save & View Source</button>
        </div>
      </header>

      <main class="main-content">
        @if (state.sections().length > 0) {
          <div class="grid-layout">
            <div class="sections-column">
              <h2>Pricing Tiers</h2>
              @for (section of state.sections(); track section.key) {
                <app-pricing-section [section]="section" />
              }
            </div>

            <div class="sidebar-column">
              <h2>Additional Charges</h2>
              
              @if (state.ruiCharges().length > 0) {
                <app-additional-charges 
                  title="Global Charges (RUI)" 
                  [charges]="state.ruiCharges()" 
                />
              }

              @if (state.frCharges().length > 0) {
                <app-additional-charges 
                  title="FR Specific Charges" 
                  [charges]="state.frCharges()" 
                />
              }
            </div>
          </div>
        } @else {
          <div class="loading">
            <p>Loading pricing data...</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .container {
      width: 100%;
      max-width: 1800px;
      margin: 0 auto;
      padding: 1.5rem;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }
    .header h1 {
      margin: 0;
      color: #0f172a;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-save {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-save:hover { background: #059669; }
    
    .btn-clear {
      background: white;
      color: #ef4444;
      border: 1px solid #fca5a5;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-clear:hover { background: #fef2f2; border-color: #ef4444; }

    .btn-undo, .btn-redo {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-undo:hover:not(:disabled), .btn-redo:hover:not(:disabled) { background: #e2e8f0; }
    .btn-undo:disabled, .btn-redo:disabled { opacity: 0.5; cursor: not-allowed; }

    .grid-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 380px;
      gap: 1.5rem;
      align-items: start;
    }

    /* Make sidebar sticky so it stays on screen when scrolling the left table */
    .sidebar-column {
      position: sticky;
      top: 1.5rem;
      max-height: calc(100vh - 3rem);
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    @media (max-width: 1200px) {
      .grid-layout { grid-template-columns: 1fr; }
      .sidebar-column {
        position: static;
        max-height: none;
      }
    }

    h2 {
      font-size: 1.125rem;
      color: #475569;
      margin-top: 0;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: #64748b;
      font-size: 1.125rem;
    }
  `]
})
export class PricingContainerComponent implements OnInit {
  state = inject(PricingStateService);
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get('pricing.json').subscribe({
      next: (data) => {
        this.state.initialize(data);
      },
      error: (err) => {
        console.error('Failed to load pricing.json. Ensure it is in the public folder.', err);
      }
    });
  }

  clearState() {
    if (confirm('Are you sure you want to discard your changes?')) {
      this.state.clearSavedState();
      window.location.reload();
    }
  }

  save() {
    const serialized = this.state.serialize();
    console.log(JSON.stringify(serialized, null, 2));
    alert('Configuration saved to localStorage and printed to console!');
  }
}
