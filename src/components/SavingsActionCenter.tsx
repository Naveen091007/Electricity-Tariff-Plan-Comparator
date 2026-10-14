import { formatINR } from '../utils/currency'
import { calculateBill } from '../utils/billing'
import type { ConsumptionInput, BillBreakdown } from '../utils/billing'
import type { TariffPlan } from '../data/tariffs'

interface Props {
  consumption: ConsumptionInput
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  plans: TariffPlan[]
  onTryScenario: (newConsumption: ConsumptionInput) => void
}

interface ActionCard {
  icon: string
  title: string
  why: string
  saving: number
  scenario: ConsumptionInput
}

export default function SavingsActionCenter({
  consumption,
  breakdowns,
  cheapestId,
  plans,
  onTryScenario,
}: Props) {
  if (breakdowns.length === 0 || !cheapestId) {
    return (
      <p className="text-sm text-gray-400 py-3">
        Enter your consumption above to see personalised savings actions.
      </p>
    )
  }

  const currentCheapest = breakdowns.find(b => b.planId === cheapestId)
  if (!currentCheapest) {
    return (
      <p className="text-sm text-gray-400 py-3">
        Enter your consumption above to see personalised savings actions.
      </p>
    )
  }

  const cards: ActionCard[] = []

  // Card 1: Peak shift (only if peak > 100)
  if (consumption.peak > 100) {
    const adjPeak = consumption.peak * 0.8
    const adjOffPeak = consumption.offPeak + consumption.peak * 0.2
    const adjConsumption: ConsumptionInput = {
      peak: adjPeak,
      normal: consumption.normal,
      offPeak: adjOffPeak,
    }
    const newBills = plans.map(p => calculateBill(p, adjConsumption))
    const newCheapest = newBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b)
    const saving = currentCheapest.totalBill - newCheapest.totalBill
    if (saving > 0) {
      cards.push({
        icon: '⏰',
        title: 'Shift 20% Peak to Off-Peak',
        why: 'Move some of your high-cost peak usage to cheaper off-peak hours.',
        saving,
        scenario: adjConsumption,
      })
    }
  }

  // Card 2: Plan switch (most expensive → cheapest)
  const sortedBreakdowns = [...breakdowns].sort((a, b) => b.totalBill - a.totalBill)
  const mostExpensive = sortedBreakdowns[0]
  if (mostExpensive && mostExpensive.planId !== cheapestId) {
    const saving = mostExpensive.totalBill - currentCheapest.totalBill
    if (saving > 0) {
      cards.push({
        icon: '🔄',
        title: `Switch: ${mostExpensive.planName} → ${currentCheapest.planName}`,
        why: `Switching from the most expensive plan saves you money immediately.`,
        saving,
        scenario: consumption,
      })
    }
  }

  // Card 3: Reduce all by 10%
  const scaledConsumption: ConsumptionInput = {
    peak: consumption.peak * 0.9,
    normal: consumption.normal * 0.9,
    offPeak: consumption.offPeak * 0.9,
  }
  const scaledBills = plans.map(p => calculateBill(p, scaledConsumption))
  const scaledCheapest = scaledBills.reduce((a, b) => a.totalBill < b.totalBill ? a : b)
  const reduceSaving = currentCheapest.totalBill - scaledCheapest.totalBill
  if (reduceSaving > 0) {
    cards.push({
      icon: '📉',
      title: 'Reduce Overall Usage by 10%',
      why: 'Small efficiency gains — LED lights, shorter cycles — add up quickly.',
      saving: reduceSaving,
      scenario: scaledConsumption,
    })
  }

  if (cards.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-3">
        No additional savings actions found for the current consumption.
      </p>
    )
  }

  return (
    <div className="space-y-3 pt-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">{card.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#0f2744] text-sm">{card.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{card.why}</p>
              <div className="mt-2 text-sm font-bold text-[#2d7d46]">
                Save {formatINR(card.saving)}/month · {formatINR(card.saving * 12)}/year
              </div>
              <button
                onClick={() => onTryScenario(card.scenario)}
                className="mt-2 text-xs text-[#2d7d46] font-medium hover:underline"
              >
                Try This Scenario →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
