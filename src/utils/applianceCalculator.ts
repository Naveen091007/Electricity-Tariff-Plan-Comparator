export interface ApplianceItem {
  id: string
  name: string
  wattage: number
  quantity: number
  hoursPerDay: number
  daysPerMonth: number
}

export const PRESET_APPLIANCES: Omit<ApplianceItem, 'id' | 'quantity' | 'hoursPerDay' | 'daysPerMonth'>[] = [
  { name: 'Air Conditioner (1.5 ton)', wattage: 1500 },
  { name: 'Ceiling Fan', wattage: 75 },
  { name: 'Refrigerator', wattage: 200 },
  { name: 'Washing Machine', wattage: 500 },
  { name: 'LED Light (15W)', wattage: 15 },
  { name: 'Television (LED)', wattage: 100 },
  { name: 'Microwave Oven', wattage: 1200 },
  { name: 'Water Heater (Geyser)', wattage: 2000 },
  { name: 'Laptop', wattage: 60 },
  { name: 'Desktop Computer', wattage: 150 },
  { name: 'Wi-Fi Router', wattage: 10 },
  { name: 'Mobile Charger', wattage: 5 },
]

export function calculateMonthlyKWh(appliance: ApplianceItem): number {
  return (appliance.wattage * appliance.quantity * appliance.hoursPerDay * appliance.daysPerMonth) / 1000
}

export function calculateMonthlyCost(kwh: number, ratePerKWh: number = 7.20): number {
  return kwh * ratePerKWh
}

export function calculateTotalEnergyAndCost(appliances: ApplianceItem[], ratePerKWh: number = 7.20): {
  totalKWh: number
  totalCost: number
  appliancesWithDetails: (ApplianceItem & { kwh: number; cost: number })[]
} {
  const appliancesWithDetails = appliances.map(appliance => {
    const kwh = calculateMonthlyKWh(appliance)
    const cost = calculateMonthlyCost(kwh, ratePerKWh)
    return { ...appliance, kwh, cost }
  })

  const totalKWh = appliancesWithDetails.reduce((sum, item) => sum + item.kwh, 0)
  const totalCost = appliancesWithDetails.reduce((sum, item) => sum + item.cost, 0)

  return { totalKWh, totalCost, appliancesWithDetails }
}

// LocalStorage utilities
const STORAGE_KEY = 'wattwise_appliances'

export function saveAppliancesToLocalStorage(appliances: ApplianceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances))
  } catch (error) {
    console.error('Failed to save appliances to localStorage:', error)
  }
}

export function loadAppliancesFromLocalStorage(): ApplianceItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored) as ApplianceItem[]
    // Ensure all loaded appliances have the required fields
    return parsed.map(item => ({
      id: item.id || generateId(),
      name: item.name || 'Unknown Appliance',
      wattage: typeof item.wattage === 'number' ? item.wattage : 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      hoursPerDay: typeof item.hoursPerDay === 'number' ? item.hoursPerDay : 0,
      daysPerMonth: typeof item.daysPerMonth === 'number' ? item.daysPerMonth : 30,
    }))
  } catch (error) {
    console.error('Failed to load appliances from localStorage:', error)
    return []
  }
}

function generateId(): string {
  return `appliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
