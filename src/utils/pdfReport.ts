import jsPDF from 'jspdf'
import { formatINR } from './currency'
import type { BillBreakdown, ConsumptionInput } from './billing'
import type { TariffPlan } from '../data/tariffs'

interface ReportData {
  consumption: ConsumptionInput
  breakdowns: BillBreakdown[]
  cheapestId: string | null
  savingsVsCheapest: Record<string, number>
  plans: TariffPlan[]
  applianceKWh?: number
  applianceCost?: number
}

const NAVY  = [15, 39, 68] as const    // #0f2744
const GREEN = [45, 125, 70] as const   // #2d7d46
const GRAY  = [100, 100, 100] as const

function setFill(doc: jsPDF, rgb: readonly [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2])
}
function setDraw(doc: jsPDF, rgb: readonly [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2])
}
function setFont(doc: jsPDF, rgb: readonly [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2])
}

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()   // 210
  const ph = doc.internal.pageSize.getHeight()  // 297
  const margin = 14
  let y = 0

  // ── Header banner ─────────────────────────────────────────────────────────
  setFill(doc, NAVY)
  doc.rect(0, 0, pw, 30, 'F')

  setFont(doc, [255, 255, 255])
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('⚡ WattWise', margin, 13)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Smart Electricity Tariff Comparator', margin, 20)

  doc.setFontSize(8)
  doc.text(
    `Report generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    pw - margin,
    20,
    { align: 'right' }
  )
  y = 38

  // ── Disclaimer ────────────────────────────────────────────────────────────
  setFill(doc, [255, 248, 225])
  doc.rect(margin, y, pw - margin * 2, 10, 'F')
  doc.setFontSize(7.5)
  setFont(doc, [120, 80, 0])
  doc.text(
    '⚠ Demonstration rates only — not official electricity-board tariffs. Verify with your utility provider.',
    margin + 2, y + 6.5
  )
  y += 15

  // ── Section helper ────────────────────────────────────────────────────────
  function sectionTitle(title: string) {
    setFont(doc, NAVY)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    setDraw(doc, GREEN)
    doc.setLineWidth(0.5)
    doc.line(margin, y + 1.5, pw - margin, y + 1.5)
    y += 8
  }

  function row(label: string, value: string, indent = 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setFont(doc, GRAY)
    doc.text(label, margin + indent, y)
    setFont(doc, NAVY)
    doc.setFont('helvetica', 'bold')
    doc.text(value, pw - margin, y, { align: 'right' })
    y += 6
  }

  // ── Monthly Consumption ───────────────────────────────────────────────────
  sectionTitle('Monthly Consumption Input')
  const { peak, normal, offPeak } = data.consumption
  const total = peak + normal + offPeak
  row('Peak Hours', `${peak.toFixed(0)} kWh`)
  row('Normal Hours', `${normal.toFixed(0)} kWh`)
  row('Off-Peak Hours', `${offPeak.toFixed(0)} kWh`)
  row('Total Consumption', `${total.toFixed(0)} kWh / month`)
  y += 4

  // ── Tariff Comparison ─────────────────────────────────────────────────────
  sectionTitle('Tariff Plan Comparison')

  const sorted = [...data.breakdowns].sort((a, b) => a.totalBill - b.totalBill)

  for (const b of sorted) {
    const isBest = b.planId === data.cheapestId
    if (isBest) {
      setFill(doc, [232, 245, 238])
      doc.rect(margin, y - 4, pw - margin * 2, 34, 'F')
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    setFont(doc, NAVY)
    doc.text(b.planName + (isBest ? '  ✓ Best Value' : ''), margin + 2, y + 1)
    if (isBest) {
      doc.setFontSize(8)
      setFont(doc, GREEN)
      doc.text('RECOMMENDED', pw - margin - 2, y + 1, { align: 'right' })
    }
    y += 6

    const plan = data.plans.find(p => p.id === b.planId)!
    row('Fixed Charge', formatINR(b.fixedCharge), 4)
    row(`Peak (${plan.peakRate} ₹/kWh × ${peak} kWh)`, formatINR(b.peakCost), 4)
    row(`Normal (${plan.normalRate} ₹/kWh × ${normal} kWh)`, formatINR(b.normalCost), 4)
    row(`Off-Peak (${plan.offPeakRate} ₹/kWh × ${offPeak} kWh)`, formatINR(b.offPeakCost), 4)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    setFont(doc, NAVY)
    doc.text('Monthly Total', margin + 4, y)
    setFont(doc, isBest ? GREEN : NAVY)
    doc.text(formatINR(b.totalBill), pw - margin, y, { align: 'right' })
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setFont(doc, GRAY)
    doc.text(`Annual Estimate: ${formatINR(b.totalBill * 12)}`, margin + 4, y)
    y += 8
  }

  // ── Savings Summary ───────────────────────────────────────────────────────
  if (data.cheapestId && sorted.length > 1) {
    sectionTitle('Savings Summary')
    const best = sorted[0]
    const others = sorted.slice(1)
    for (const o of others) {
      const monthly = o.totalBill - best.totalBill
      const annual = monthly * 12
      row(
        `${o.planName} vs ${best.planName}`,
        `Save ${formatINR(monthly)}/mo (${formatINR(annual)}/yr)`
      )
    }
    y += 4
  }

  // ── Appliance Analysis ───────────────────────────────────────────────────
  if (data.applianceKWh && data.applianceKWh > 0) {
    sectionTitle('Appliance Energy Analysis')
    row('Total Appliance Consumption', `${data.applianceKWh.toFixed(2)} kWh / month`)
    if (data.applianceCost) row('Estimated Appliance Cost', formatINR(data.applianceCost))
    y += 4
  }

  // ── Savings Tips ─────────────────────────────────────────────────────────
  if (y > ph - 60) {
    doc.addPage()
    y = margin + 8
  }
  sectionTitle('Practical Savings Suggestions')
  const tips = [
    '• Shift heavy loads (AC, washing machine) to off-peak hours where possible.',
    '• Replace incandescent bulbs with LED lighting (up to 80% energy saving).',
    '• Set AC thermostat to 24–26 °C; each degree lower increases consumption by ~6–8%.',
    '• Run washing machines and dishwashers with full loads only.',
    '• Unplug idle devices — standby power can account for 5–10% of your bill.',
    '• Consider BEE 5-star rated appliances when replacing old equipment.',
  ]
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  setFont(doc, GRAY)
  for (const tip of tips) {
    doc.text(tip, margin + 2, y)
    y += 6
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  setFill(doc, NAVY)
  doc.rect(0, ph - 12, pw, 12, 'F')
  setFont(doc, [180, 200, 220])
  doc.setFontSize(7)
  doc.text(
    'WattWise — Educational demonstration. Not official advice.',
    pw / 2, ph - 4.5,
    { align: 'center' }
  )

  // ── Save ──────────────────────────────────────────────────────────────────
  const dateStr = new Date().toISOString().slice(0, 10)
  doc.save(`WattWise-Report-${dateStr}.pdf`)
}
