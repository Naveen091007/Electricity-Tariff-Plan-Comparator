# WattWise — Smart Electricity Tariff Comparator

A professional web application for comparing electricity tariff plans based on time-of-use consumption patterns. Built for a hackathon with React + TypeScript + Vite.

## Features

- **Time-of-Use Bill Calculation**: Enter monthly consumption in peak, normal, and off-peak periods
- **Three Sample Tariff Plans**: Basic Flat, Time-of-Use, and Economy Night with configurable rates
- **Bill Comparison**: Calculate total estimated bills with detailed cost breakdowns
- **Smart Recommendation**: Identifies cheapest plan and shows monthly/annual savings
- **What-If Simulator**: Interactive chart showing how changing peak usage affects costs
- **Break-Even Calculator**: Finds exact peak usage where two plans cost the same
- **Professional Dashboard**: Modern energy-management UI with responsive design
- **Input Validation**: Handles invalid values, zero consumption, and equal-cost plans

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling with custom design system
- **Recharts** for interactive data visualization
- **Vitest** for unit testing calculation logic
- **Testing Library** for component testing

## Project Structure

```
src/
├── components/          # React components
│   ├── ConsumptionForm.tsx  # Input form for kWh consumption
│   ├── BillCard.tsx         # Individual tariff plan card
│   ├── ComparisonChart.tsx  # Stacked bar chart comparison
│   ├── WhatIfSimulator.tsx  # Interactive line chart simulator
│   ├── BreakEvenCalc.tsx    # Break-even point calculator
│   ├── RecommendationPanel.tsx # Cheapest plan recommendation
│   └── Disclaimer.tsx       # Rate disclaimer
├── data/
│   └── tariffs.ts      # Tariff plan definitions and sample data
├── utils/
│   ├── billing.ts      # Core calculation functions
│   └── billing.test.ts # Unit tests for calculations
├── test/
│   └── setup.ts        # Test setup configuration
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Tailwind CSS imports
```

## Core Calculation Functions

The application uses deterministic TypeScript functions for all bill calculations (no AI models):

1. `calculateBill()`: Computes bill for a single tariff plan
2. `calculateAllBills()`: Compares all plans and finds cheapest
3. `findBreakEven()`: Calculates peak usage where two plans cost the same
4. `generateWhatIfSeries()`: Creates data for what-if simulation
5. `validateConsumption()`: Validates user input values

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## Key Design Decisions

1. **Deterministic Calculations**: All billing logic uses pure TypeScript functions for reliability
2. **Configurable Tariff Data**: Sample rates are clearly labeled as fictional demonstration data
3. **No External Dependencies**: Core demo works without paid APIs, databases, or AI services
4. **Professional UI**: Navy/green color scheme with clean cards and readable charts
5. **Responsive Design**: Works on desktop and mobile devices
6. **Comprehensive Validation**: Handles edge cases like zero consumption and invalid values

## Disclaimer

⚠️ **Important**: The tariff rates in this application are fictional demonstration values and do not represent any official electricity-board pricing. Always verify current rates with your utility provider before making decisions.

## License

MIT - For educational and demonstration purposes only.