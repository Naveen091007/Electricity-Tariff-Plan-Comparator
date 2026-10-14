
import type { BillBreakdown } from '../utils/billing'
import { formatINR } from '../utils/currency'

interface Props {
  breakdown: BillBreakdown
  isCheapest: boolean
  savings: number
}

export default function BillCard({ breakdown: b, isCheapest, savings }: Props) {
  const rows = [
    { label: 'Fixed Charge',    value: b.fixedCharge },
    { label: 'Peak Energy',     value: b.peakCost },
    { label: 'Normal Energy',   value: b.normalCost },
    { label: 'Off-Peak Energy', value: b.offPeakCost },
  ]

  return (
    <div
      className={`relative rounded-2xl border border-t-4 p-5 transition-shadow ${
        isCheapest
          ? 'border-[#2d7d46] shadow-md bg-[#e8f5ee]'
          : 'border-gray-100 shadow-sm bg-white'
      }`}
      style={{ borderTopColor: b.color }}
    >
      {isCheapest && (
        <span className="absolute -top-3 left-4 bg-[#2d7d46] text-white text-xs font-bold px-3 py-0.5 rounded-full shadow">
          ✓ Best Value
        </span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{background: b.color}} />
        <h3 className="font-semibold text-[#0f2744] text-sm">{b.planName}</h3>
      </div>
      <div className="text-3xl font-bold text-[#0f2744] mb-4">
        {formatINR(b.totalBill)}
        <span className="text-sm font-normal text-gray-400 ml-1">/month</span>
      </div>
      <div className="space-y-1.5 text-xs">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between text-gray-600">
            <span>{r.label}</span>
            <span className="font-medium">{formatINR(r.value)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-1.5 flex justify-between font-semibold text-[#0f2744]">
          <span>Total</span>
          <span>{formatINR(b.totalBill)}</span>
        </div>
        <div className="flex justify-between text-gray-400 mt-1">
          <span>Annual estimate</span>
          <span>{formatINR(b.totalBill * 12)}/year</span>
        </div>
      </div>
      {savings > 0 && (
        <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          {formatINR(savings)}/month more than best plan
        </div>
      )}
    </div>
  )
}
