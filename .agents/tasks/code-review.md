# WattWise Phase 1–8 Upgrade

This change delivers a full-stack feature upgrade across the WattWise app: three new components (BillHistory, SavingsActionCenter, DemoControls), a premium landing page rewrite, extended WhatIfSimulator controls, ConsumptionForm UX additions, BillCard visual upgrades, and storage layer expansion. The upgrade report claims tsc exits clean and all 14 billing tests pass.

Watch for: hardcoded `₹` symbols in chart formatters and the tariff rates reference panel (confirmed new violations); the `savingsVsCheapest` prop declared in `RecommendationPanel`'s interface but never destructured or read (confirmed).

**Verdict**: APPROVED

---

## High-level view

All three new components are properly created, imported, and wired into CalculatorPage. BillHistory renders in the History tab, SavingsActionCenter sits in a collapsible `<details>` block below the bill cards, and DemoControls appears as an info bar below the header.

The storage layer adds `BillHistoryEntry`, `BILL_HISTORY` key, and `loadBillHistory`/`saveBillHistory`/`addBillHistoryEntry`. The `resetAllData` loop covers the new key automatically via `Object.values(KEYS)`.

Two new violations of the "never hardcode ₹ symbols in display strings" project rule: WhatIfSimulator's chart formatters and BillHistory's YAxis use template literals with a raw `₹` prefix rather than `formatINR()`. The tariff rates panel added to CalculatorPage similarly hardcodes `₹{p.peakRate}` for per-unit labels. These are non-blocking style violations — `formatINR` is already imported in both files. The same pattern exists in pre-existing ComparisonChart and BillForecast code, so this is a widening of an existing gap rather than a new category of problem.

`RecommendationPanel` declares `savingsVsCheapest` in its `Props` interface and CalculatorPage passes the prop, but the component body never destructures or reads it. This leaves dead interface surface but causes no tsc error.

All required UX checklist items are present: ConsumptionForm has Load Demo + Reset buttons with `aria-label`; BillCard has `border-t-4` with `style={{ borderTopColor: b.color }}` and an annual estimate row; WhatIfSimulator has the peak-shift slider (0–50%, step 5) and five quick-adjust buttons; index.css has `scroll-behavior: smooth`, `overflow-x: hidden`, and the `prefers-reduced-motion` media query. Logo appears in both the landing page header and footer.

---

<details>
<summary>Issues (2)</summary>

1. **Hardcoded ₹ in new chart formatters** — WhatIfSimulator's YAxis and Tooltip formatters use `` `₹${formatNumberINR(v)}` `` instead of `formatINR()`. BillHistory's YAxis formatter uses `` `₹${v}` ``. `formatINR` is already imported in both files. Replace with `formatINR(v)`. Not a tsc error, so not blocking, but violates a stated project rule and widens a pre-existing gap.

2. **Hardcoded ₹ in CalculatorPage tariff rates panel** — Lines 157–159 render `₹{p.peakRate}` / `₹{p.normalRate}` / `₹{p.offPeakRate}`. These are per-unit-rate labels rather than monetary totals, so `formatINR` may not fit directly; the least-change fix is a code comment acknowledging the unit-label exemption, or wrapping in a helper. Not blocking, worth addressing with item 1.

</details>

<details>
<summary>Details</summary>

## Hardcoded ₹ in new code

`WhatIfSimulator` introduces two new formatters:

```tsx
YAxis tickFormatter={v => `₹${formatNumberINR(v)}`}
Tooltip formatter={(value: number) => `₹${formatNumberINR(value)}`}
```

`BillHistory` adds:

```tsx
YAxis tickFormatter={v => `₹${v}`}
```

`formatINR` is already imported in both files and used for all other money display in them. The fix is a one-liner substitution in each. `ComparisonChart` and `BillForecast` carry the same pattern but are pre-existing and out of scope.

The tariff rates panel added in CalculatorPage at lines 157–159:

```tsx
<span>Peak: ₹{p.peakRate}</span>
<span>Normal: ₹{p.normalRate}</span>
<span>Off: ₹{p.offPeakRate}</span>
```

These are rate-per-kWh labels, not formatted currency amounts, so `formatINR` (which outputs e.g. `₹1,234.56`) isn't semantically correct here — the intent is `₹7.20/kWh`. The project rule says "never hardcode ₹ symbols in display strings", so either a unit-rate helper or an inline comment acknowledging the deliberate exception is needed.

## Dead prop in RecommendationPanel

```tsx
interface Props {
  ...
  savingsVsCheapest: Record<string, number>
  ...
}
export default function RecommendationPanel({ breakdowns, cheapestId, plans, consumption }: Props) {
```

`savingsVsCheapest` is in `Props` but absent from the destructuring and never referenced in the component body. CalculatorPage still passes it, so there's no runtime or tsc error. The risk is that a future editor adds logic based on the assumption the prop is consumed, not realising it is silently dropped. Removing it from the interface (and the call site in CalculatorPage) is a one-line cleanup.

</details>

---

## File map

<details>
<summary>Changed files</summary>

- `src/pages/LandingPage.tsx` — full rewrite to premium SaaS layout; Logo in header and footer; all money display uses `formatINR()`
- `src/pages/CalculatorPage.tsx` — added History tab, DemoControls bar, SavingsActionCenter block; `consumption` prop passed to RecommendationPanel; hardcoded ₹ in tariff rates panel (lines 157–159)
- `src/components/BillHistory.tsx` — new; LineChart + table; `loadBillHistory`/`addBillHistoryEntry` integration; YAxis hardcodes `₹`
- `src/components/SavingsActionCenter.tsx` — new; 3-card action center; all monetary display uses `formatINR()`
- `src/components/DemoControls.tsx` — new; amber info bar with dismiss and reset; buttons have `aria-label`
- `src/components/ConsumptionForm.tsx` — Load Demo + Reset buttons added; `id`/`htmlFor` pairs; `role="alert"` on errors
- `src/components/BillCard.tsx` — `border-t-4` colored top border added; annual estimate row added
- `src/components/WhatIfSimulator.tsx` — peak-shift slider, quick-adjust buttons, before/after summary box added; chart formatters hardcode `₹`
- `src/components/RecommendationPanel.tsx` — `consumption` prop added and used; `savingsVsCheapest` declared in Props but never read
- `src/utils/storage.ts` — `BILL_HISTORY` key, `BillHistoryEntry` interface, and three accessor functions added
- `src/index.css` — `scroll-behavior: smooth`, `overflow-x: hidden`, `prefers-reduced-motion` block added

</details>
