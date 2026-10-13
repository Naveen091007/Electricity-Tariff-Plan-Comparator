
import type { ConsumptionInput } from '../utils/billing'

interface Props {
  value: ConsumptionInput
  onChange: (v: ConsumptionInput) => void
  errors: Record<string, string>
}

const FIELDS: { key: keyof ConsumptionInput; label: string; hint: string; color: string }[] = [
  { key: 'peak',    label: 'Peak Hours',     hint: 'e.g. 7–9 am & 5–8 pm',  color: 'text-red-600' },
  { key: 'normal',  label: 'Normal Hours',   hint: 'e.g. 9 am – 5 pm',      color: 'text-yellow-600' },
  { key: 'offPeak', label: 'Off-Peak Hours', hint: 'e.g. 10 pm – 7 am',     color: 'text-blue-600' },
]

export default function ConsumptionForm({ value, onChange, errors }: Props) {
  function handleChange(key: keyof ConsumptionInput, raw: string) {
    const num = parseFloat(raw)
    onChange({ ...value, [key]: isNaN(num) ? (raw === '' ? 0 : NaN) : num })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-[#0f2744] mb-1">Monthly Consumption</h2>
      <p className="text-sm text-gray-500 mb-5">Enter how many kWh you use in each period.</p>
      <div className="grid grid-cols-1 gap-4">
        {FIELDS.map(({ key, label, hint, color }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className={`font-semibold ${color}`}>{label}</span>
              <span className="font-normal text-gray-400 ml-2">({hint})</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                value={isNaN(value[key]) ? '' : value[key]}
                onChange={e => handleChange(key, e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7d46]/50 ${
                  errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="0"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400">kWh</span>
            </div>
            {errors[key] && (
              <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-[#e8f5ee] rounded-lg px-4 py-3 text-xs text-gray-600">
        <strong>Total:</strong>{' '}
        {isNaN(value.peak) || isNaN(value.normal) || isNaN(value.offPeak)
          ? '—'
          : `${(value.peak + value.normal + value.offPeak).toFixed(0)} kWh / month`}
      </div>
    </div>
  )
}