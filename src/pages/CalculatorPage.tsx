import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ConsumptionForm from '../components/ConsumptionForm'
import BillCard from '../components/BillCard'
import ComparisonChart from '../components/ComparisonChart'
import WhatIfSimulator from '../components/WhatIfSimulator'
import BreakEvenCalc from '../components/BreakEvenCalc'
import RecommendationPanel from '../components/RecommendationPanel'
import Disclaimer from '../components/Disclaimer'
import BudgetTracker from '../components/BudgetTracker'
import BillForecast from '../components/BillForecast'
import BillHistory from '../components/BillHistory'
import DemoControls from '../components/DemoControls'
import SavingsActionCenter from '../components/SavingsActionCenter'
import { TARIFF_PLANS } from '../data/tariffs'
import { calculateAllBills, validateConsumption } from '../utils/billing'
import { generatePDFReport } from '../utils/pdfReport'
import { loadConsumption, saveConsumption } from '../utils/storage'
import { formatINR } from '../utils/currency'
import type { ConsumptionInput } from '../utils/billing'

const FALLBACK: ConsumptionInput = { peak: 120, normal: 250, offPeak: 80 }

type Tab = 'compare' | 'whatif' | 'breakeven' | 'forecast' | 'history'

export default function CalculatorPage() {
  const [consumption, setConsumption] = useState<ConsumptionInput>(() => {
    const saved = loadConsumption()
    return saved ?? FALLBACK
  })
  const [tab, setTab] = useState<Tab>('compare')
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Persist consumption to localStorage whenever it changes
  useEffect(() => {
    const { peak, normal, offPeak } = consumption
    if (!isNaN(peak) && !isNaN(normal) && !isNaN(offPeak)) {
      saveConsumption(consumption)
    }
  }, [consumption])

  const errors = useMemo(() => validateConsumption(consumption), [consumption])
  const hasErrors = Object.keys(errors).length > 0

  const { breakdowns, cheapestId, savingsVsCheapest } = useMemo(
    () =>
      hasErrors
        ? { breakdowns: [], cheapestId: null, savingsVsCheapest: {} }
        : calculateAllBills(TARIFF_PLANS, consumption),
    [consumption, hasErrors]
  )

  const cheapestBill = useMemo(() => {
    if (!cheapestId || breakdowns.length === 0) return 0
    return breakdowns.find(b => b.planId === cheapestId)?.totalBill ?? 0
  }, [breakdowns, cheapestId])

  function handleDownloadPDF() {
    if (hasErrors || breakdowns.length === 0) return
    setPdfGenerating(true)
    try {
      generatePDFReport({
        consumption,
        breakdowns,
        cheapestId,
        savingsVsCheapest,
        plans: TARIFF_PLANS,
      })
    } finally {
      setPdfGenerating(false)
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'compare',   label: '📊 Compare Plans' },
    { id: 'whatif',    label: '🔧 What-If' },
    { id: 'breakeven', label: '⚖️ Break-Even' },
    { id: 'forecast',  label: '📈 Forecast' },
    { id: 'history',   label: '📅 History' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-[#0f2744] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size={38} dark subtitle="Smart Electricity Tariff Comparator" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="text-blue-200 hover:text-white transition-colors">Home</Link>
              <Link to="/appliances" className="text-blue-200 hover:text-white transition-colors">
                🔌 Appliances
              </Link>
              <button
                onClick={handleDownloadPDF}
                disabled={hasErrors || pdfGenerating}
                className="flex items-center gap-1.5 bg-[#2d7d46] hover:bg-[#246838] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              >
                {pdfGenerating ? '⏳ Generating…' : '⬇ Download Report (PDF)'}
              </button>
            </nav>

            {/* Mobile menu toggle */}
            <button className="md:hidden text-xl" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="md:hidden mt-3 pb-3 border-t border-white/20 pt-3 flex flex-col gap-3 text-sm">
              <Link to="/" className="text-blue-200 hover:text-white" onClick={() => setMobileNavOpen(false)}>← Home</Link>
              <Link to="/appliances" className="text-blue-200 hover:text-white" onClick={() => setMobileNavOpen(false)}>🔌 Appliance Calculator</Link>
              <button
                onClick={() => { handleDownloadPDF(); setMobileNavOpen(false) }}
                disabled={hasErrors || pdfGenerating}
                className="text-left text-blue-200 hover:text-white disabled:opacity-40"
              >
                ⬇ Download PDF Report
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Demo Controls bar */}
      <DemoControls onLoadDemo={() => setConsumption({ peak: 180, normal: 300, offPeak: 120 })} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: inputs + budget ── */}
          <div className="lg:col-span-1 space-y-4">
            <ConsumptionForm value={consumption} onChange={setConsumption} errors={errors} />

            {/* Budget Tracker */}
            <BudgetTracker estimatedBill={cheapestBill} />

            {/* Tariff rates reference */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#0f2744] mb-3">Sample Tariff Rates</h3>
              <div className="space-y-3">
                {TARIFF_PLANS.map(p => (
                  <div key={p.id} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span className="font-semibold text-gray-700">{p.name}</span>
                      <span className="text-gray-400 ml-auto whitespace-nowrap">{formatINR(p.fixedCharge)}/mo fixed</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pl-4 text-gray-500">
                      <span>Peak: ₹{p.peakRate}</span>
                      <span>Normal: ₹{p.normalRate}</span>
                      <span>Off: ₹{p.offPeakRate}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 italic">
                All rates are demo / illustrative values in INR (₹/kWh).
              </p>
            </div>

            <Disclaimer />
          </div>

          {/* ── Right column: results ── */}
          <div className="lg:col-span-2 space-y-5">
            {hasErrors ? (
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-600 font-medium">Please fix the input errors to see results.</p>
              </div>
            ) : (
              <>
                <RecommendationPanel
                  breakdowns={breakdowns}
                  cheapestId={cheapestId}
                  savingsVsCheapest={savingsVsCheapest}
                  plans={TARIFF_PLANS}
                  consumption={consumption}
                />

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

                {/* Smart Savings Action Center */}
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

                {/* Tabbed area */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100 overflow-x-auto">
                    {TABS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-shrink-0 flex-1 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
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
                    {tab === 'compare'   && <ComparisonChart breakdowns={breakdowns} cheapestId={cheapestId} />}
                    {tab === 'whatif'    && <WhatIfSimulator plans={TARIFF_PLANS} consumption={consumption} />}
                    {tab === 'breakeven' && <BreakEvenCalc plans={TARIFF_PLANS} consumption={consumption} />}
                    {tab === 'forecast'  && <BillForecast currentBill={cheapestBill} />}
                    {tab === 'history'   && <BillHistory breakdowns={breakdowns} consumption={consumption} />}
                  </div>
                </div>

                {/* PDF download button (mobile-friendly alternative) */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-[#0f2744] hover:bg-[#1e3a5f] disabled:opacity-50 text-white py-3 rounded-2xl font-medium text-sm transition-colors"
                >
                  {pdfGenerating ? '⏳ Generating report…' : '⬇ Download Savings Report (PDF)'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>WattWise — Demo application · Rates are fictional</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/appliances" className="hover:text-gray-600">Appliances</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
