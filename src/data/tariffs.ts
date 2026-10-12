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
}

export const TARIFF_PLANS: TariffPlan[] = [
  {
    id: 'basic',
    name: 'Basic Flat',
    provider: 'DemoGrid Co.',
    color: '#1e40af',
    fixedCharge: 8.00,
    peakRate: 0.18,
    normalRate: 0.18,
    offPeakRate: 0.18,
    description: 'Simple flat rate — all hours billed equally. Good for predictable usage.',
  },
  {
    id: 'tou',
    name: 'Time-of-Use',
    provider: 'DemoGrid Co.',
    color: '#2d7d46',
    fixedCharge: 10.00,
    peakRate: 0.28,
    normalRate: 0.17,
    offPeakRate: 0.09,
    description: 'Higher peak charges offset by cheap off-peak rates. Ideal for flexible households.',
  },
  {
    id: 'economy',
    name: 'Economy Night',
    provider: 'DemoGrid Co.',
    color: '#d97706',
    fixedCharge: 12.00,
    peakRate: 0.22,
    normalRate: 0.15,
    offPeakRate: 0.07,
    description: 'Premium off-peak discount for EV owners and night-shift workers.',
  },
]

export const DISCLAIMER =
  '⚠️ These are fictional demonstration tariff rates and do not represent any official electricity-board pricing. Always verify current rates with your utility provider.'