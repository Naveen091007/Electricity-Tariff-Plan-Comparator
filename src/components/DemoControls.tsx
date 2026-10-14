import { useState } from 'react'
import { resetAllData } from '../utils/storage'

interface Props {
  onLoadDemo: () => void
}

export default function DemoControls({ onLoadDemo }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">🎮 Try a demo scenario:</span>
        <button
          onClick={onLoadDemo}
          className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full text-xs font-medium transition-colors"
        >
          Load Demo Scenario
        </button>
        <button
          onClick={() => { resetAllData(); window.location.reload() }}
          className="px-3 py-1 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 rounded-full text-xs font-medium transition-colors"
        >
          🔄 Reset Everything
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo controls"
          className="ml-auto text-amber-600 hover:text-amber-800 font-bold text-base leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
