# WattWise — Project Steering

## Project Overview
WattWise is a React + TypeScript + Vite web application — a Smart Electricity Tariff Comparator for Indian households.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (navy/sage color palette)
- **Charts**: Recharts
- **Routing**: react-router-dom
- **PDF Export**: jspdf
- **Testing**: Vitest + Testing Library
- **State**: React useState/useMemo + localStorage (no backend)

## Key Conventions
- All monetary values are in Indian Rupees (₹). Use `formatINR()` from `src/utils/currency.ts` — never hardcode `$` or `₹` symbols in display strings.
- All billing calculations live in `src/utils/billing.ts`. Keep them pure deterministic functions.
- Tariff data is in `src/data/tariffs.ts`. Rates are fictional demo values — always label them as such.
- localStorage helpers are in `src/utils/storage.ts`. Use these for persistence (budget, forecast history, appliances, consumption).
- The Logo component is at `src/components/Logo.tsx` — use it in all page headers.

## Routes
- `/` → `src/pages/LandingPage.tsx`
- `/calculator` → `src/pages/CalculatorPage.tsx`
- `/appliances` → `src/pages/ApplianceCalculator.tsx`

## Color Palette
- Navy: `#0f2744` (primary dark)
- Sage/Green: `#2d7d46` (accent)
- Emerald highlight: `#34d399`
- Background: `#f9fafb` (gray-50)

## Important Rules
- No backend, database, or paid APIs.
- Do not claim demo tariff rates are official.
- Keep all 14 billing unit tests passing (`npm test`).
- Run `npx tsc --noEmit` and `npm run build` to verify before finishing any change.
