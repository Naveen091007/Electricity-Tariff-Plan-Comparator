# WattWise Upgrade — Implementation Plan

## Current State Notes

### Key Exports & Types

**`src/utils/billing.ts`**
- `interface ConsumptionInput { peak: number; normal: number; offPeak: number }`
- `interface BillBreakdown { planId, planName, fixedCharge, peakCost, normalCost, offPeakCost, totalEnergyCost, totalBill, color }`
- `calculateBill(plan, consumption) → BillBreakdown`
- `calculateAllBills(plans, consumption) → { breakdowns, cheapestId, savingsVsCheapest }`
- `findBreakEven(planA, planB, normal, offPeak) → number | null`
- `generateWhatIfSeries(plans, normal, offPeak, maxPeak?, steps?) → { peak, [planId]: number }[]`
- `validateConsumption(input) → Record<string, string>`

**`src/utils/currency.ts`**
- `formatINR(amount: number): string` — always use for ₹ display
- `formatNumberINR(amount: number): string` — no symbol, used in charts

**`src/utils/storage.ts`**
- `interface BudgetSettings { monthlyBudget: number }`
- `interface ForecastEntry { month: string; bill: number; consumption: number }`
- `loadBudget / saveBudget / resetBudget`
- `loadForecastHistory / saveForecastHistory / addForecastEntry / resetForecastHistory`
- `loadConsumption / saveConsumption`
- `resetAllData()` — **already exists**, clears all KEYS values
- KEYS object uses `wattwise_budget`, `wattwise_forecast_history`, `wattwise_appliances`, `wattwise_consumption`

**`src/data/tariffs.ts`**
- `interface TariffPlan { id, name, provider, color, fixedCharge, peakRate, normalRate, offPeakRate, description, isDemo }`
- `TARIFF_PLANS: TariffPlan[]` — 3 plans: `basic` (#1e40af), `tou` (#2d7d46), `economy` (#d97706)
- `DISCLAIMER: string`

**`src/components/Logo.tsx`**
- `default export Logo({ size?, dark?, subtitle? })` — use `dark` for white text, no `dark` for navy text

**`src/components/ConsumptionForm.tsx`**
- Props: `{ value: ConsumptionInput; onChange: (v: ConsumptionInput) => void; errors: Record<string, string> }`
- Renders 3 labeled inputs; shows errors inline

**`src/components/BillCard.tsx`**
- Props: `{ breakdown: BillBreakdown; isCheapest: boolean; savings: number }`

**`src/components/RecommendationPanel.tsx`**
- Props: `{ breakdowns: BillBreakdown[]; cheapestId: string | null; savingsVsCheapest: Record<string, number>; plans: TariffPlan[] }`

**`src/components/WhatIfSimulator.tsx`**
- Props: `{ plans: TariffPlan[]; consumption: ConsumptionInput }`
- Internal state: `maxPeak: number`

**`src/pages/CalculatorPage.tsx`**
- `Tab` type currently: `'compare' | 'whatif' | 'breakeven' | 'forecast'`
- TABS array: 4 items
- `cheapestBill` derived from breakdowns
- Already imports: Logo, ConsumptionForm, BillCard, ComparisonChart, WhatIfSimulator, BreakEvenCalc, RecommendationPanel, Disclaimer, BudgetTracker, BillForecast, TARIFF_PLANS, calculateAllBills, validateConsumption, generatePDFReport, loadConsumption, saveConsumption, formatINR

**`src/pages/LandingPage.tsx`**
- Currently uses custom Tailwind class names like `text-navy`, `bg-navy`, `bg-sage` which are NOT inline hex — these all need replacing
- Has `FeatureCard`, `StepCard`, `FAQItem` sub-components defined in-file
- Hero headline: "Take Control of Your Electricity Bill" (needs replacing)
- Already imports: formatINR, Logo

**`src/index.css`** — currently only has 3 Tailwind directives, nothing else

### Build & Test Commands
- `npm test` — runs Vitest (`vitest --run`), 14 billing tests must pass
- `npx tsc --noEmit` — strict TypeScript check (noUnusedLocals, noUnusedParameters)
- `npm run build` — `tsc && vite build`
- TypeScript strict mode ON: unused vars/params are errors

### Gotchas & Dependencies
1. **`noUnusedLocals` / `noUnusedParameters`** is `true` — every import and every parameter must be used or it's a TS error
2. **No new npm packages** — must use only recharts (already installed), react, react-router-dom, jspdf
3. `resetAllData()` already exists in storage.ts — do NOT add it again
4. Phase 4 (`SavingsActionCenter`) needs the new `BillHistory` tab from Phase 3, and both need Phase 3's storage additions
5. Phase 6 (`DemoControls`) calls `resetAllData()` from storage.ts — confirm the import path
6. Phase 2 (`CalculatorPage`) adds `onTryScenario` callback — this must be wired before SavingsActionCenter (Phase 4) uses it
7. The LandingPage currently references `text-navy`, `bg-navy`, `bg-sage`, `text-sage-light`, `bg-sage-light`, `hover:text-sage-light`, `bg-navy-light`, `bg-navy-dark`, `bg-sage-pale`, `border-navy-light`, `text-sage`, `text-sage` — ALL must become inline hex equivalents
8. Recharts `LineChart` is already imported in BillForecast — BillHistory can import the same components
9. The `BreakEvenCalc` component uses `as const` assertion on a readonly tuple — be careful with that pattern

---

## PHASE 1 — Premium Landing Page

### Goal
Full rewrite of `src/pages/LandingPage.tsx`. Replace all custom Tailwind class names with inline hex colors. New headline, hero with dashboard preview card, CSS bar chart, 6-feature grid, 3-step "How It Works" with connecting line, benefits 2-col grid, accordion FAQ with CSS max-height transition, 4-col footer, mobile hamburger.

### Files Modified
- `src/pages/LandingPage.tsx` — **full rewrite**

### Detailed Changes

**Imports** (keep exactly these, no others):
```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatINR } from '../utils/currency'
import Logo from '../components/Logo'
```

**Header/Nav**
- `bg-[#0f2744]` sticky header
- Desktop nav links: `text-blue-200 hover:text-white`
- CTA button: `bg-[#2d7d46] hover:bg-[#246838] text-white px-5 py-2 rounded-full`
- Mobile hamburger: `aria-label="Open menu"` / `aria-label="Close menu"`
- Mobile menu closes on any nav link click: `onClick={() => setIsMenuOpen(false)}`

**Hero Section**
- `bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744]` — NOT `from-navy`
- Headline: `'Your Electricity Bill, Smarter.'`
- Subtext: `'Compare tariff plans, track your usage, and find the smartest way to save every month.'`
- CTA 1: `<Link to="/calculator">` — `bg-white text-[#0f2744] hover:bg-gray-100 px-6 py-3 rounded-full font-semibold`
- CTA 2: `<a href="#features">Explore Features</a>` — `border-2 border-white hover:bg-white/10`
- Dashboard preview card (right side): `bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6`
  - Label above: small `text-xs text-blue-200` text: `'Sample Preview'`
  - Row 1: "Monthly Bill" → `formatINR(1875)` (large bold)
  - Row 2: "Best Plan" → "Time-of-Use"
  - Row 3: "Monthly Saving" → `formatINR(320)` in `text-[#34d399]`
  - Row 4: CSS mini bar chart — **no Recharts** — three `<div>` bars with heights 70%, 100%, 35%, colors `bg-red-400`, `bg-yellow-400`, `bg-[#34d399]` inside a `h-10 flex items-end gap-1` container; labels "Peak", "Normal", "Off-peak" below

**Features Section** (`id="features"`)
- 6 cards in `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card: `bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6`
- Icon: colored circle `w-10 h-10 rounded-full flex items-center justify-center text-xl` with inline bg color per feature
- 6 features (icon, circleColor, title, description):
  1. '⚖️', `bg-[#dbeafe]`, 'Smart Tariff Comparison', 'Compare electricity plans side-by-side with full cost breakdowns across peak, normal, and off-peak periods.'
  2. '🔌', `bg-[#dcfce7]`, 'Appliance Energy Detective', 'Identify which appliances drive your bill and calculate their exact monthly energy cost.'
  3. '⏰', `bg-[#fef9c3]`, 'Smart Savings Simulator', 'Simulate how shifting load to off-peak hours or switching plans cuts your monthly bill.'
  4. '💰', `bg-[#fce7f3]`, 'Monthly Budget Guardian', 'Set a budget target and get alerted when your estimated bill approaches the limit.'
  5. '📅', `bg-[#e0e7ff]`, 'Bill History', 'Track month-over-month bills, spot trends, and see if your changes are paying off.'
  6. '📄', `bg-[#f3e8ff]`, 'PDF Savings Report', 'Download a professional report showing your bill breakdown and savings opportunities.'

**How It Works Section** (`id="how-it-works"`)
- Background: `bg-gray-50`
- 3 steps in `grid grid-cols-1 md:grid-cols-3 gap-8 relative`
- Connecting line (desktop only): `hidden md:block absolute top-6 left-1/4 right-1/4 h-0.5 bg-[#2d7d46] z-0` (positioned between steps)
- Each step: centered column with `w-12 h-12 rounded-full bg-[#2d7d46] text-white flex items-center justify-center text-xl font-bold mb-4`
- 3 steps: (1) "Enter Your Consumption", (2) "Compare Tariff Plans", (3) "Find Best Plan & Save"
- CTA at bottom: `<Link to="/calculator">` with `bg-[#2d7d46] hover:bg-[#246838] text-white px-8 py-3 rounded-full`

**Benefits Section** (`id="benefits"`)
- Background: `bg-white`
- 2-column grid inside `max-w-4xl mx-auto`: `grid grid-cols-1 sm:grid-cols-2 gap-4`
- Each benefit item: `flex items-start gap-3` with `text-[#2d7d46] mt-0.5 font-bold` checkmark span
- 6 benefits:
  1. 'Instant side-by-side bill comparison across all tariff plans'
  2. 'Detailed cost breakdown: fixed charge + peak + normal + off-peak'
  3. 'Identify high-consumption appliances impacting your bill'
  4. 'Simulate savings from off-peak shifting or plan switching'
  5. 'Track monthly budget with visual progress bar'
  6. 'Download a professional PDF savings report'

**FAQ Section** (`id="faq"`)
- Background: `bg-gray-50`
- Accordion using local state per item
- Smooth expand with CSS `max-height` transition — use `style={{ maxHeight: isOpen ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease' }}` on the answer div — NOT conditional rendering
- 5 FAQs (same content as current file, keep them)

**Footer**
- `bg-[#0f2744] text-white`
- 4-col grid: `grid grid-cols-1 md:grid-cols-4 gap-8`
  - Col 1: `<Logo size={34} dark />` + tagline `text-sm text-blue-300`
  - Col 2: "Quick Links" — Home, Calculator, Appliances links
  - Col 3: "Features" — list of 4 feature names as plain `<span>` text (no links), `text-blue-300 text-sm`
  - Col 4: "Disclaimer" — `text-xs text-blue-300` with DISCLAIMER text (import from `'../data/tariffs'` — add this import)
- Bottom bar: `border-t border-white/10 mt-8 pt-6 text-center text-xs text-blue-400`

**Verify:** `npm run build` — zero TS errors, no references to `text-navy`, `bg-navy`, `bg-sage`, etc.

---

## PHASE 2 — Dashboard Improvements

### 2A — Add storage key for bill history

**File:** `src/utils/storage.ts`

Add `BILL_HISTORY: 'wattwise_bill_history'` to the `KEYS` object.

Add after the existing `resetAllData()` function:

```typescript
export interface BillHistoryEntry {
  month: string  // "YYYY-MM"
  consumption: { peak: number; normal: number; offPeak: number }
  bills: Record<string, number>  // planId → totalBill
  cheapestPlanId: string
}

const MAX_BILL_HISTORY = 12

export function loadBillHistory(): BillHistoryEntry[] {
  return safeGet<BillHistoryEntry[]>(KEYS.BILL_HISTORY, [])
}

export function saveBillHistory(entries: BillHistoryEntry[]): void {
  safeSet(KEYS.BILL_HISTORY, entries.slice(-MAX_BILL_HISTORY))
}

export function addBillHistoryEntry(entry: BillHistoryEntry): BillHistoryEntry[] {
  const existing = loadBillHistory()
  const updated = existing.filter(e => e.month !== entry.month)
  updated.push(entry)
  updated.sort((a, b) => a.month.localeCompare(b.month))
  const trimmed = updated.slice(-MAX_BILL_HISTORY)
  saveBillHistory(trimmed)
  return trimmed
}
```

**Note:** `KEYS` is typed `as const` — add `BILL_HISTORY` before the `as const` assertion. The `StorageKey` type union will auto-update.

**Verify:** `npx tsc --noEmit` — no errors

### 2B — Upgrade ConsumptionForm

**File:** `src/components/ConsumptionForm.tsx`

Add two buttons below the Total div:

```tsx
<div className="mt-3 flex gap-2">
  <button
    type="button"
    onClick={() => onChange({ peak: 180, normal: 300, offPeak: 120 })}
    className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-[#e8f5ee] text-[#2d7d46] font-medium hover:bg-[#d1fae5] transition-colors"
  >
    Load Demo
  </button>
  <button
    type="button"
    onClick={() => onChange({ peak: 0, normal: 0, offPeak: 0 })}
    className="flex-1 text-xs py-1.5 px-3 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
  >
    Reset
  </button>
</div>
```

Keep all existing validation logic and FIELDS array unchanged.

**Verify:** `npx tsc --noEmit`

### 2C — Upgrade BillCard

**File:** `src/components/BillCard.tsx`

1. Add colored top border to the outer div: `border-t-4` with `style={{ borderTopColor: b.color }}` inline style
2. After the Total row in the breakdown table, add annual cost line:

```tsx
<div className="flex justify-between text-gray-400 mt-1 text-xs">
  <span>Annual estimate</span>
  <span>{formatINR(b.totalBill * 12)}/year</span>
</div>
```

The outer div's `className` changes from:
```
`relative rounded-2xl border p-5 transition-shadow ${isCheapest ? 'border-[#2d7d46] ...' : 'border-gray-100 ...'}`
```
to:
```
`relative rounded-2xl border border-t-4 p-5 transition-shadow ${isCheapest ? 'border-[#2d7d46] ...' : 'border-gray-100 ...'}`
```

**Verify:** `npx tsc --noEmit`

### 2D — Upgrade RecommendationPanel

**File:** `src/components/RecommendationPanel.tsx`

Add a "Smart Savings Actions" subsection after the existing calculation transparency note. New props needed: also requires `consumption: ConsumptionInput` — add to Props interface.

**Updated Props:**
```typescript
interface Props {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  savingsVsCheapest: Record<string, number>
  plans: TariffPlan[]
  consumption: ConsumptionInput  // NEW
}
```

Add import: `import type { ConsumptionInput } from '../utils/billing'`

Add `calculateBill` to the import from `../utils/billing`.

After the existing calculation transparency note, add:

```tsx
{/* Smart Savings Actions */}
<div className="mt-4 border-t border-[#2d7d46]/20 pt-4">
  <h3 className="text-sm font-semibold text-[#0f2744] mb-3">💡 Smart Savings Actions</h3>
  <div className="space-y-2 text-xs text-gray-600">
    {/* Tip 1: Peak shift (only if peak > 100) */}
    {consumption.peak > 100 && (() => {
      const adjPeak = consumption.peak * 0.8
      const adjOffPeak = consumption.offPeak + consumption.peak * 0.2
      const newBills = plans.map(p => calculateBill(p, { ...consumption, peak: adjPeak, offPeak: adjOffPeak }))
      const newCheapest = newBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b)
      const saving = cheapest.totalBill - newCheapest.totalBill
      return saving > 0 ? (
        <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
          <span className="font-medium text-[#0f2744]">Shift 20% peak to off-peak: </span>
          save {formatINR(saving)}/month ({formatINR(saving * 12)}/year)
        </div>
      ) : null
    })()}
    {/* Tip 2: Plan switch saving */}
    {monthlySaving > 0.01 && (
      <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
        <span className="font-medium text-[#0f2744]">Switch to {cheapest.planName}: </span>
        save {formatINR(monthlySaving)}/month ({formatINR(annualSaving)}/year)
      </div>
    )}
    {/* Tip 3: Reduce all by 10% */}
    {(() => {
      const scaled = { peak: consumption.peak * 0.9, normal: consumption.normal * 0.9, offPeak: consumption.offPeak * 0.9 }
      const newBills = plans.map(p => calculateBill(p, scaled))
      const newCheapestBill = newBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b).totalBill
      const saving = cheapest.totalBill - newCheapestBill
      return saving > 0.01 ? (
        <div className="bg-white rounded-lg px-3 py-2 border border-[#2d7d46]/20">
          <span className="font-medium text-[#0f2744]">Reduce overall usage by 10%: </span>
          new best bill {formatINR(newCheapestBill)}/month, saving {formatINR(saving)}/month
        </div>
      ) : null
    })()}
  </div>
</div>
```

**Important:** Update the `RecommendationPanel` call in `CalculatorPage.tsx` to pass `consumption={consumption}`.

**Verify:** `npx tsc --noEmit`

### 2E — Add History tab + DemoControls to CalculatorPage

**File:** `src/pages/CalculatorPage.tsx`

1. Extend `Tab` type: `type Tab = 'compare' | 'whatif' | 'breakeven' | 'forecast' | 'history'`
2. Add `{ id: 'history', label: '📅 History' }` to TABS array
3. Add `tab === 'history' && <BillHistory breakdowns={breakdowns} consumption={consumption} />` to the tab panel
4. Import `BillHistory` from `'../components/BillHistory'`
5. Import `DemoControls` from `'../components/DemoControls'`
6. Render `<DemoControls onLoadDemo={() => setConsumption({ peak: 180, normal: 300, offPeak: 120 })} />` directly below the `<header>` tag (outside `<main>`)
7. Pass `consumption={consumption}` to `<RecommendationPanel>`
8. Import `SavingsActionCenter` from `'../components/SavingsActionCenter'`
9. Add below the bill cards grid (and above the tabbed area), wrapped in `<details open>`:
```tsx
<details open className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <summary className="px-5 py-3 text-sm font-semibold text-[#0f2744] cursor-pointer select-none hover:bg-gray-50">
    🎯 Smart Savings Action Center
  </summary>
  <div className="px-5 pb-5">
    <SavingsActionCenter
      consumption={consumption}
      breakdowns={breakdowns}
      cheapestId={cheapestId}
      plans={TARIFF_PLANS}
      onTryScenario={setConsumption}
    />
  </div>
</details>
```

**Verify:** `npx tsc --noEmit`

---

## PHASE 3 — Bill History Component

### 3A — Create BillHistory component

**File:** `src/components/BillHistory.tsx` — **new file**

**Imports:**
```tsx
import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatINR } from '../utils/currency'
import type { BillBreakdown } from '../utils/billing'
import type { ConsumptionInput } from '../utils/billing'
import { loadBillHistory, addBillHistoryEntry, saveBillHistory } from '../utils/storage'
import type { BillHistoryEntry } from '../utils/storage'
```

**Props:**
```typescript
interface Props {
  breakdowns: BillBreakdown[]
  consumption: ConsumptionInput
}
```

**Helper:**
```typescript
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const d = new Date(parseInt(y), parseInt(m) - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}
```

**Component logic:**
- `const [history, setHistory] = useState<BillHistoryEntry[]>(() => loadBillHistory())`
- "Save This Month" button:
  - Builds `BillHistoryEntry` from current `breakdowns` and `consumption`
  - `bills` = `Object.fromEntries(breakdowns.map(b => [b.planId, b.totalBill]))`
  - `cheapestPlanId` = planId with minimum totalBill in breakdowns
  - Calls `addBillHistoryEntry(entry)` and updates state
  - Disabled when `breakdowns.length === 0`
- Table columns: Month | Total kWh | Cheapest Plan | Bill | vs Last Month
  - "vs Last Month" = `↑` (red) or `↓` (green) with absolute difference using `formatINR()`
  - First row has no comparison indicator
- LineChart: `dataKey="bill"` over `month` labels, single line, `stroke="#2d7d46"`
- "Clear History" button: calls `saveBillHistory([])` and `setHistory([])`
- Empty state: `<div className="text-center py-10 text-gray-400"><div className="text-4xl mb-3">📅</div><p>No history yet. Save this month's bill to get started.</p></div>`
- Footer note: `<p className="text-xs text-gray-400 mt-3">Data stored in this browser only.</p>`
- Max 12 months — enforced by `addBillHistoryEntry`

**Chart data computation:**
```typescript
const chartData = useMemo(() => {
  return history.map(e => {
    const cheapestBill = e.bills[e.cheapestPlanId] ?? 0
    return { month: fmtMonth(e.month), bill: cheapestBill }
  })
}, [history])
```

**Verify:** `npx tsc --noEmit`

---

## PHASE 4 — Smart Savings Action Center

**File:** `src/components/SavingsActionCenter.tsx` — **new file**

**Imports:**
```tsx
import { formatINR } from '../utils/currency'
import { calculateBill } from '../utils/billing'
import type { ConsumptionInput, BillBreakdown } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'
```

**Props interface:**
```typescript
interface Props {
  consumption: ConsumptionInput
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  plans: TariffPlan[]
  onTryScenario: (newConsumption: ConsumptionInput) => void
}
```

**Three action cards — compute in the component body (not as inner functions, to keep TypeScript happy):**

1. **Peak Shift card** (only rendered if `consumption.peak > 100`):
   - `adjPeak = consumption.peak * 0.8`
   - `adjOffPeak = consumption.offPeak + consumption.peak * 0.2`
   - Compute new bills with `calculateBill` for all plans, find new cheapest
   - `saving = currentCheapestBill - newCheapestBill`
   - Only show if `saving > 0`
   - "Try This Scenario →" calls `onTryScenario({ peak: adjPeak, normal: consumption.normal, offPeak: adjOffPeak })`

2. **Plan Switch card** (always shown if `cheapestId` exists and there's a second plan that costs more):
   - Find the currently most-expensive plan (or the `basic` plan if cheapest is already basic)
   - Show switching from most expensive to cheapest with monthly + annual saving

3. **Reduce 10% card** (always shown):
   - `scaled = { peak: peak*0.9, normal: normal*0.9, offPeak: offPeak*0.9 }`
   - Compute new cheapest bill
   - Show saving
   - "Try This Scenario →" calls `onTryScenario(scaled)`

**Card layout:**
```tsx
<div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
  <div className="flex items-start gap-3">
    <div className="text-2xl">{icon}</div>
    <div className="flex-1">
      <h4 className="font-semibold text-[#0f2744] text-sm">{title}</h4>
      <p className="text-xs text-gray-500 mt-0.5">{why}</p>
      <div className="mt-2 text-sm font-bold text-[#2d7d46]">
        Save {formatINR(saving)}/month · {formatINR(saving * 12)}/year
      </div>
      <button
        onClick={() => onTryScenario(scenario)}
        className="mt-2 text-xs text-[#2d7d46] font-medium hover:underline"
      >
        Try This Scenario →
      </button>
    </div>
  </div>
</div>
```

**Container:**
```tsx
<div className="space-y-3 pt-3">
  {/* conditional cards */}
</div>
```

If no cards apply (zero consumption), show: `<p className="text-sm text-gray-400 py-3">Enter your consumption above to see personalised savings actions.</p>`

**Verify:** `npx tsc --noEmit`

---

## PHASE 5 — Enhanced What-If Simulator

**File:** `src/components/WhatIfSimulator.tsx`

**New state variables:**
```typescript
const [peakShiftPct, setPeakShiftPct] = useState(0)   // 0–50, step 5
const [scalePct, setScalePct]         = useState(100)  // 70/90/100/110/120
```

**Derived effective consumption** (replaces direct use of `consumption` in series/breakEvens):
```typescript
const effectiveConsumption = useMemo((): ConsumptionInput => {
  const shifted = {
    peak: consumption.peak * (1 - peakShiftPct / 100),
    normal: consumption.normal,
    offPeak: consumption.offPeak + consumption.peak * (peakShiftPct / 100),
  }
  return {
    peak: shifted.peak * (scalePct / 100),
    normal: shifted.normal * (scalePct / 100),
    offPeak: shifted.offPeak * (scalePct / 100),
  }
}, [consumption, peakShiftPct, scalePct])
```

Pass `effectiveConsumption.normal` and `effectiveConsumption.offPeak` to `generateWhatIfSeries` and `findBreakEven` (replacing `consumption.normal` / `consumption.offPeak`).

**Before/after summary box** — compute original cheapest bill and simulated cheapest bill:
```typescript
const originalCheapestBill = useMemo(() => {
  if (plans.length === 0) return 0
  return Math.min(...plans.map(p => {
    const b = calculateBill(p, consumption)
    return b.totalBill
  }))
}, [plans, consumption])

const simulatedCheapestBill = useMemo(() => {
  if (plans.length === 0) return 0
  return Math.min(...plans.map(p => {
    const b = calculateBill(p, effectiveConsumption)
    return b.totalBill
  }))
}, [plans, effectiveConsumption])
```

Add import: `import { calculateBill } from '../utils/billing'` and `import { formatINR } from '../utils/currency'`

**Two new controls rendered above the chart**, between the header row and `<ResponsiveContainer>`:

1. Peak Shift slider:
```tsx
<div className="mb-4">
  <label className="block text-sm text-gray-600 mb-1">
    Shift % of peak to off-peak: <strong>{peakShiftPct}%</strong>
  </label>
  <input
    type="range"
    min={0} max={50} step={5}
    value={peakShiftPct}
    onChange={e => setPeakShiftPct(parseInt(e.target.value))}
    className="w-full accent-[#2d7d46]"
    aria-label="Peak shift percentage"
  />
  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
    <span>0%</span><span>25%</span><span>50%</span>
  </div>
</div>
```

2. Quick adjust buttons:
```tsx
<div className="flex flex-wrap gap-2 mb-4">
  {([['−30%', 70], ['−10%', 90], ['Original', 100], ['+10%', 110], ['+20%', 120]] as [string, number][]).map(
    ([label, val]) => (
      <button
        key={val}
        onClick={() => setScalePct(val)}
        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
          scalePct === val
            ? 'bg-[#2d7d46] text-white border-[#2d7d46]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d7d46]'
        }`}
      >
        {label}
      </button>
    )
  )}
</div>
```

**Before/after summary box** — rendered after the quick buttons, before the chart:
```tsx
{(peakShiftPct > 0 || scalePct !== 100) && (
  <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 rounded-xl p-4 text-center text-sm">
    <div>
      <div className="text-xs text-gray-500 mb-0.5">Original cheapest</div>
      <div className="font-bold text-[#0f2744]">{formatINR(originalCheapestBill)}</div>
    </div>
    <div>
      <div className="text-xs text-gray-500 mb-0.5">Simulated cheapest</div>
      <div className="font-bold text-[#0f2744]">{formatINR(simulatedCheapestBill)}</div>
    </div>
    <div>
      <div className="text-xs text-gray-500 mb-0.5">Monthly saving</div>
      <div className={`font-bold ${originalCheapestBill - simulatedCheapestBill > 0 ? 'text-[#2d7d46]' : 'text-red-500'}`}>
        {formatINR(Math.abs(originalCheapestBill - simulatedCheapestBill))}
        {originalCheapestBill - simulatedCheapestBill >= 0 ? ' ↓' : ' ↑'}
      </div>
    </div>
  </div>
)}
```

**Verify:** `npx tsc --noEmit`

---

## PHASE 6 — Demo Controls

**File:** `src/components/DemoControls.tsx` — **new file**

**Props:**
```typescript
interface Props {
  onLoadDemo: () => void
}
```

**Import:**
```tsx
import { useState } from 'react'
import { resetAllData } from '../utils/storage'
```

**Component:**
```tsx
export default function DemoControls({ onLoadDemo }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">🎮 Try a demo scenario:</span>
        <button
          onClick={onLoadDemo}
          className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full text-xs font-medium transition-colors"
        >
          Load Demo Scenario
        </button>
        <button
          onClick={() => { resetAllData(); window.location.reload() }}
          className="px-3 py-1 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 rounded-full text-xs font-medium transition-colors"
        >
          🔄 Reset Everything
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo controls"
          className="ml-auto text-amber-600 hover:text-amber-800 font-bold text-base leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
```

`resetAllData()` already exists in storage.ts — no changes to storage.ts needed for this phase.

**Verify:** `npx tsc --noEmit`

---

## PHASE 7 — Accessibility & Polish

**File:** `src/index.css`

Replace the 3-line file with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**File:** `src/components/ConsumptionForm.tsx`

1. Add `id={key}` to each `<input>` element
2. Change `<label>` to use `htmlFor={key}` — currently the label wraps the input which is valid, but adding `htmlFor` makes it explicit. Change each label from wrapping to `<label htmlFor={key} ...>` with the input separate from it (or keep wrapping but add `htmlFor` to be explicit — either works, wrapping is fine)
3. Add `role="alert"` to error `<p>` elements: change `<p className="mt-1 text-xs text-red-500">{errors[key]}</p>` to `<p role="alert" className="mt-1 text-xs text-red-500">{errors[key]}</p>`

**File:** `src/components/BillHistory.tsx` (created in Phase 3)
- Ensure "Save This Month" button has `aria-label="Save this month's bill to history"`
- Ensure "Clear History" button has `aria-label="Clear all bill history"`

**File:** `src/components/DemoControls.tsx` (created in Phase 6)
- The dismiss button already has `aria-label="Dismiss demo controls"` — confirmed in Phase 6

**File:** `src/pages/LandingPage.tsx` (created in Phase 1)
- The hamburger button already has `aria-label="Open menu"` / `aria-label="Close menu"` — confirmed in Phase 1

**Verify:** `npx tsc --noEmit`, then `npm run build`

---

## PHASE 8 — Build Verification

### Steps (in order):

1. Run `npm test` — all 14 tests in `src/utils/billing.test.ts` must pass. These tests only test `billing.ts` which has not been modified — they should pass unchanged. If they don't, something was accidentally modified.

2. Run `npx tsc --noEmit` — fix every error before proceeding. Common failure modes:
   - Unused import (tsconfig has `noUnusedLocals: true`)
   - Missing prop passed to updated component (e.g. `consumption` on RecommendationPanel)
   - Type mismatch in BillHistoryEntry (bills key is `Record<string, number>`)
   - `peakShiftPct` / `scalePct` state not used (make sure both feed into `effectiveConsumption`)

3. Run `npm run build` — fix any Vite/esbuild errors (usually same as tsc but catches more)

4. Write `c:\Users\NAVEEN S\Desktop\electicity tariff\.agents\tasks\upgrade-report.md` summarizing:
   - Files created/modified per phase
   - Test results (14 passing)
   - TS and build status
   - Any deviations from the plan

---

## Phase Dependency Order

```
Phase 2A (storage.ts additions)
  ↓
Phase 3A (BillHistory — uses BillHistoryEntry from storage)
  ↓
Phase 4 (SavingsActionCenter — standalone, but wired in CalculatorPage)
  ↓
Phase 6 (DemoControls — standalone)
  ↓
Phase 2E (CalculatorPage — imports BillHistory, DemoControls, SavingsActionCenter)
  ↓
Phase 2B/2C/2D (ConsumptionForm, BillCard, RecommendationPanel — can be done in parallel with Phase 2E prep)

Phase 1 (LandingPage) — fully independent, can be done at any point
Phase 5 (WhatIfSimulator) — independent of new components, depends only on existing billing utils
Phase 7 (index.css + aria) — independent, do after components are stable
Phase 8 (verification) — always last
```

**Recommended actual execution order:**
1. Phase 2A — storage.ts (BillHistoryEntry + helpers)
2. Phase 1 — LandingPage full rewrite
3. Phase 2B — ConsumptionForm (Load Demo / Reset)
4. Phase 2C — BillCard (border-t-4, annual cost)
5. Phase 2D — RecommendationPanel (Smart Savings, new consumption prop)
6. Phase 3A — BillHistory new component
7. Phase 4 — SavingsActionCenter new component
8. Phase 6 — DemoControls new component
9. Phase 5 — WhatIfSimulator enhancements
10. Phase 2E — CalculatorPage (new tab, DemoControls, SavingsActionCenter, updated RecommendationPanel call)
11. Phase 7 — index.css + aria polish
12. Phase 8 — Full verification pass

---

## Type Definitions Needed (New Components)

### `BillHistoryEntry` (in `src/utils/storage.ts`)
```typescript
export interface BillHistoryEntry {
  month: string
  consumption: { peak: number; normal: number; offPeak: number }
  bills: Record<string, number>
  cheapestPlanId: string
}
```

### `SavingsActionCenter` Props
```typescript
interface Props {
  consumption: ConsumptionInput
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  plans: TariffPlan[]
  onTryScenario: (newConsumption: ConsumptionInput) => void
}
```

### `BillHistory` Props
```typescript
interface Props {
  breakdowns: BillBreakdown[]
  consumption: ConsumptionInput
}
```

### `DemoControls` Props
```typescript
interface Props {
  onLoadDemo: () => void
}
```

### Updated `RecommendationPanel` Props
```typescript
interface Props {
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  savingsVsCheapest: Record<string, number>
  plans: TariffPlan[]
  consumption: ConsumptionInput  // NEW — added in Phase 2D
}
```
