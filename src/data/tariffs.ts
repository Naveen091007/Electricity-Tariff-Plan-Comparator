export interface TariffPlan {
  id: string
  name: string
  provider: string
  color: string
  fixedCharge: number
  peakRate: number
  normalRate: number
  offPeakRate: number
  description: string
  isDemo: boolean
}

export const TARIFF_PLANS: TariffPlan[] = [
  {
    id: 'basic',
    name: 'Basic Flat',
    provider: 'DemoGrid Co.',
    color: '#1e40af',
    fixedCharge: 120.00,
    peakRate: 7.20,
    normalRate: 7.20,
    offPeakRate: 7.20,
    description: 'Simple flat rate — all hours billed equally. Good for predictable usage.',
    isDemo: true,
  },
  {
    id: 'tou',
    name: 'Time-of-Use',
    provider: 'DemoGrid Co.',
    color: '#2d7d46',
    fixedCharge: 150.00,
    peakRate: 10.50,
    normalRate: 6.50,
    offPeakRate: 3.50,
    description: 'Higher peak charges offset by cheap off-peak rates. Ideal for flexible households.',
    isDemo: true,
  },
  {
    id: 'economy',
    name: 'Economy Night',
    provider: 'DemoGrid Co.',
    color: '#d97706',
    fixedCharge: 180.00,
    peakRate: 8.50,
    normalRate: 5.80,
    offPeakRate: 2.80,
    description: 'Premium off-peak discount for EV owners and night-shift workers.',
    isDemo: true,
  },
]

export const DISCLAIMER =
  '⚠️ These are fictional demonstration tariff rates (shown in INR ₹) and do not represent any official electricity-board pricing. Always verify current rates with your utility provider.'