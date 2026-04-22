# Dynamic Pricing Management UI

This is a modern, reactive Angular 18+ web application designed to handle complex, nested, and matrix-based pricing structures seamlessly. 

## 🚀 Key Features

### 1. **Deep Reactivity with Angular Signals**
The entire application state is modeled using Angular's latest `signal()` and `computed()` primitives. There is **no NgRx** or cumbersome RxJS plumbing. Every table cell, configuration tier, and additional charge is bound directly to a signal. When you update a cell, the UI updates instantly, and the state changes are automatically tracked.

### 2. **Flexible & Dynamic Data Parsing**
The `PricingNormalizerService` parses dynamic, unstructured `pricing.json` mock data. Whether a pricing section is a simple "flat" array of prices or a "size-based matrix" (where prices are dependent on both Item Quantity Tiers and Item Sizes), the normalizer cleanly abstracts this away into standard `PricingSection` objects.

### 3. **Dynamic Table Layouts using CSS Grid**
The table logic allows users to seamlessly add (`+ Add Tier`) or remove columns. Instead of fragile `<table>` elements, it utilizes a deeply reactive `CSS Grid`. The grid columns are updated on-the-fly (`grid-template-columns` is a computed signal tied directly to the number of tiers), guaranteeing pixel-perfect alignment.

### 4. **Undo / Redo History Stack**
Because the state is highly normalized, every change triggers a debounce-free auto-save `effect()`. Every time an action occurs, a snapshot of the serialized state is pushed into a history stack. This allows for instantaneous "Undo" and "Redo" functionality across the entire pricing dashboard without complex reducers.

### 5. **Clean Component Architecture**
- **`PricingContainer`**: Root wrapper that fetches the data via HTTP and acts as the orchestrator.
- **`PricingSection`**: Handles the UI layout for an entire pricing block, managing column additions and the dynamic grid structure.
- **`PricingRow` & `PricingCell`**: Dumb, recursive components that purely bind to their reactive signal states (`WritableSignal<CellValue>`).
- **`AdditionalCharges`**: A flexible side-panel that can render stitch formulas (`over $X, every $Y`), percentages, fixed price inputs, and size-tiered grids automatically.

## 🛠 Setup & Local Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli).

### Prerequisites
- Node.js (v18+)
- npm

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/AjoJosee/Faya-angular-internship.git
cd Faya-angular-internship
npm install
```

### Running the App
Start the local development server:
```bash
npm run dev
# or: npx @angular/cli@latest serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## 📈 Future Improvements

While this is heavily optimized for a robust UI, potential production enhancements could include:
1. **Zod Schema Validation:** Validate the incoming `pricing.json` structurally before parsing it to prevent UI errors from malformed backend data.
2. **OnPush Change Detection:** Applying `ChangeDetectionStrategy.OnPush` across all components to ensure that Angular entirely skips checking components unless their bound signals have explicitly updated.
3. **Backend Syncing:** Replace the `localStorage` saves with a debounced `HTTP PUT` request to synchronize the serialized pricing data to a remote database.
