import { useState, useMemo } from 'react'
import ConsumptionForm from './components/ConsumptionForm'
import BillCard from './components/BillCard'
import ComparisonChart from './components/ComparisonChart'
import WhatIfSimulator from './components/WhatIfSimulator'
import BreakEvenCalc from './components/BreakEvenCalc'
import RecommendationPanel from './components/RecommendationPanel'
import Disclaimer from './components/Disclaimer'
import { TARIFF_PLANS } from './data/tariffs'
import { calculateAllBills, validateConsumption } from './utils/billing'
import { formatINR } from './utils/currency'
import type { ConsumptionInput } from './utils/billing'

const DEFAULT_CONSUMPTION: ConsumptionInput = { peak: 120, normal: 250, offPeak: 80 }

type Tab = 'compare' | 'whatif' | 'breakeven'

export default function App() {
  const [consumption, setConsumption] = useState<ConsumptionInput>(DEFAULT_CONSUMPTION)
  const [tab, setTab] = useState<Tab>('compare')

  const errors = useMemo(() => validateConsumption(consumption), [consumption])
  const hasErrors = Object.keys(errors).length > 0

  const { breakdowns, cheapestId, savingsVsCheapest } = useMemo(
    () =>
      hasErrors
        ? { breakdowns: [], cheapestId: null, savingsVsCheapest: {} }
        : calculateAllBills(TARIFF_PLANS, consumption),
    [consumption, hasErrors]
  )

  const TABS: { id: Tab; label: string }[] = [
    { id: 'compare',   label: '📊 Compare Plans' },
    { id: 'whatif',    label: '🔧 What-If Simulator' },
    { id: 'breakeven', label: '⚖️ Break-Even' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-[#0f2744] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl font-bold tracking-tight">WattWise</h1>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">Smart Electricity Tariff Comparator</p>
          </div>
          <div className="hidden sm:block text-right text-xs text-blue-200">
            <div>Demo Application</div>
            <div>Fictional tariff data only</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — input */}
          <div className="lg:col-span-1 space-y-4">
            <ConsumptionForm value={consumption} onChange={setConsumption} errors={errors} />
            <Disclaimer />
            {/* Tariff rates reference */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#0f2744] mb-3">Sample Tariff Rates</h3>
              <div className="space-y-3">
                {TARIFF_PLANS.map(p => (
                  <div key={p.id} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{background: p.color}} />
                      <span className="font-semibold text-gray-700">{p.name}</span>
                      <span className="text-gray-400 ml-auto">{formatINR(p.fixedCharge)}/mo fixed</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pl-4 text-gray-500">
                      <span>Peak: {formatINR(p.peakRate)}</span>
                      <span>Normal: {formatINR(p.normalRate)}</span>
                      <span>Off-peak: {formatINR(p.offPeakRate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — results */}
          <div className="lg:col-span-2 space-y-5">
            {hasErrors ? (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-600 font-medium">Please fix the input errors to see results.</p>
              </div>
            ) : (
              <>
                {/* Recommendation */}
                <RecommendationPanel
                  breakdowns={breakdowns}
                  cheapestId={cheapestId}
                  savingsVsCheapest={savingsVsCheapest}
                  plans={TARIFF_PLANS}
                />

                {/* Bill Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {breakdowns.map(b => (
                    <BillCard
                      key={b.planId}
                      breakdown={b}
                      isCheapest={b.planId === cheapestId}
                      savings={savingsVsCheapest[b.planId] ?? 0}
                    />
                  ))}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100">
                    {TABS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                          tab === t.id
                            ? 'text-[#0f2744] border-b-2 border-[#2d7d46] bg-[#e8f5ee]/40'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-5">
                    {tab === 'compare' && (
                      <ComparisonChart breakdowns={breakdowns} cheapestId={cheapestId} />
                    )}
                    {tab === 'whatif' && (
                      <WhatIfSimulator plans={TARIFF_PLANS} consumption={consumption} />
                    )}
                    {tab === 'breakeven' && (
                      <BreakEvenCalc plans={TARIFF_PLANS} consumption={consumption} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5 text-center text-xs text-gray-400">
          WattWise — Demo application for educational purposes only. Rates are fictional. · Built with React + TypeScript + Vite
        </div>
      </footer>
    </div>
  )
}