import { describe, it, expect } from 'vitest'
import {
  calculateBill,
  calculateAllBills,
  findBreakEven,
  validateConsumption,
  generateWhatIfSeries,
} from './billing'
import { TARIFF_PLANS } from '../data/tariffs'

const [basic, tou, economy] = TARIFF_PLANS

describe('calculateBill', () => {
  it('calculates basic flat rate bill correctly', () => {
    const b = calculateBill(basic, { peak: 100, normal: 200, offPeak: 50 })
    expect(b.totalBill).toBeCloseTo(71, 5)
    expect(b.fixedCharge).toBe(8)
    expect(b.peakCost).toBeCloseTo(18, 5)
  })

  it('calculates TOU bill correctly', () => {
    const b = calculateBill(tou, { peak: 100, normal: 200, offPeak: 50 })
    expect(b.totalBill).toBeCloseTo(76.5, 5)
  })

  it('handles zero consumption', () => {
    const b = calculateBill(basic, { peak: 0, normal: 0, offPeak: 0 })
    expect(b.totalBill).toBeCloseTo(8, 5)
    expect(b.totalEnergyCost).toBe(0)
  })
})

describe('calculateAllBills', () => {
  it('finds cheapest plan correctly', () => {
    const { cheapestId } = calculateAllBills(TARIFF_PLANS, { peak: 0, normal: 0, offPeak: 0 })
    expect(cheapestId).toBe('basic')
  })

  it('calculates correct savings vs cheapest', () => {
    const { savingsVsCheapest, cheapestId } = calculateAllBills(TARIFF_PLANS, {
      peak: 0, normal: 0, offPeak: 0,
    })
    expect(savingsVsCheapest[cheapestId!]).toBe(0)
    expect(savingsVsCheapest['tou']).toBeCloseTo(2, 5)
    expect(savingsVsCheapest['economy']).toBeCloseTo(4, 5)
  })

  it('switches cheapest plan with high off-peak usage', () => {
    const { cheapestId } = calculateAllBills(TARIFF_PLANS, { peak: 0, normal: 0, offPeak: 2000 })
    expect(cheapestId).toBe('economy')
  })
})

describe('findBreakEven', () => {
  it('returns a positive number for crossing plans', () => {
    const x = findBreakEven(basic, tou, 100, 50)
    expect(x).not.toBeNull()
    expect(x).toBeGreaterThan(0)
  })

  it('returns null when peak rates are equal (basic vs basic)', () => {
    const x = findBreakEven(basic, basic, 100, 50)
    expect(x).toBeNull()
  })
})

describe('validateConsumption', () => {
  it('passes valid input', () => {
    const e = validateConsumption({ peak: 100, normal: 200, offPeak: 50 })
    expect(Object.keys(e)).toHaveLength(0)
  })

  it('flags negative values', () => {
    const e = validateConsumption({ peak: -1, normal: 0, offPeak: 0 })
    expect(e.peak).toBeTruthy()
  })

  it('flags NaN', () => {
    const e = validateConsumption({ peak: NaN, normal: 0, offPeak: 0 })
    expect(e.peak).toBeTruthy()
  })

  it('flags excessively large values', () => {
    const e = validateConsumption({ peak: 99999, normal: 0, offPeak: 0 })
    expect(e.peak).toBeTruthy()
  })
})

describe('generateWhatIfSeries', () => {
  it('returns correct number of data points', () => {
    const series = generateWhatIfSeries(TARIFF_PLANS, 100, 50, 400, 20)
    expect(series).toHaveLength(21)
  })

  it('first point is peak=0', () => {
    const series = generateWhatIfSeries(TARIFF_PLANS, 100, 50, 400, 10)
    expect(series[0].peak).toBe(0)
  })
})