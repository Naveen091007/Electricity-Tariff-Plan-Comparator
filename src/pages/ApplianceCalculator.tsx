import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatINR } from '../utils/currency'
import {
  ApplianceItem,
  PRESET_APPLIANCES,
  calculateTotalEnergyAndCost,
  saveAppliancesToLocalStorage,
  loadAppliancesFromLocalStorage,
} from '../utils/applianceCalculator'

const DEFAULT_APPLIANCE: Omit<ApplianceItem, 'id'> = {
  name: '',
  wattage: 0,
  quantity: 1,
  hoursPerDay: 0,
  daysPerMonth: 30,
}

const ENERGY_SAVING_TIPS = [
  {
    title: 'Use LED Lights',
    description: 'Replace incandescent bulbs with LED lights. They use 75-80% less energy and last much longer.',
    savings: 'Up to 80% energy savings',
  },
  {
    title: 'Unplug Idle Devices',
    description: 'Many devices consume standby power even when turned off. Unplug chargers, TVs, and other electronics when not in use.',
    savings: 'Up to 10% of total bill',
  },
  {
    title: 'Optimize AC Usage',
    description: 'Set your AC to 24-26°C, use timer functions, and clean filters regularly. Each degree higher can save 6-8% energy.',
    savings: 'Up to 30% on AC bill',
  },
  {
    title: 'Use Natural Light',
    description: 'Open curtains during daytime to reduce lighting needs. Position work areas near windows.',
    savings: 'Reduces lighting costs significantly',
  },
  {
    title: 'Run Appliances Efficiently',
    description: 'Use washing machines with full loads, wash in cold water, and air-dry clothes when possible.',
    savings: 'Up to 25% on laundry costs',
  },
  {
    title: 'Upgrade Old Appliances',
    description: 'Older appliances are often less energy-efficient. Look for BEE 5-star rated appliances when replacing.',
    savings: '20-50% efficiency improvement',
  },
]

export default function ApplianceCalculator() {
  const [appliances, setAppliances] = useState<ApplianceItem[]>([])
  const [editingAppliance, setEditingAppliance] = useState<Omit<ApplianceItem, 'id'> & { id?: string }>(DEFAULT_APPLIANCE)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [isEditing, setIsEditing] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadAppliancesFromLocalStorage()
    setAppliances(loaded)
  }, [])

  // Save to localStorage whenever appliances change
  useEffect(() => {
    saveAppliancesToLocalStorage(appliances)
  }, [appliances])

  const { totalKWh, totalCost, appliancesWithDetails } = useMemo(
    () => calculateTotalEnergyAndCost(appliances),
    [appliances]
  )

  const handleAddOrUpdateAppliance = () => {
    if (!editingAppliance.name.trim() || editingAppliance.wattage <= 0) {
      alert('Please enter appliance name and valid wattage')
      return
    }

    if (isEditing) {
      // Update existing appliance
      setAppliances(prev =>
        prev.map(app =>
          app.id === isEditing
            ? { ...editingAppliance, id: isEditing } as ApplianceItem
            : app
        )
      )
      setIsEditing(null)
    } else {
      // Add new appliance
      const newAppliance: ApplianceItem = {
        ...editingAppliance,
        id: `appliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      setAppliances(prev => [...prev, newAppliance])
    }

    setEditingAppliance(DEFAULT_APPLIANCE)
    setSelectedPreset('')
  }

  const handleSelectPreset = (index: number) => {
    const preset = PRESET_APPLIANCES[index]
    setEditingAppliance({
      ...DEFAULT_APPLIANCE,
      name: preset.name,
      wattage: preset.wattage,
    })
    setSelectedPreset(index.toString())
  }

  const handleEditAppliance = (appliance: ApplianceItem) => {
    setEditingAppliance(appliance)
    setIsEditing(appliance.id)
  }

  const handleDeleteAppliance = (id: string) => {
    if (confirm('Delete this appliance?')) {
      setAppliances(prev => prev.filter(app => app.id !== id))
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all appliances?')) {
      setAppliances([])
    }
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    return appliancesWithDetails
      .sort((a, b) => b.kwh - a.kwh)
      .slice(0, 8) // Top 8 appliances
      .map(appliance => ({
        name: appliance.name.length > 15 ? `${appliance.name.substring(0, 15)}...` : appliance.name,
        kwh: parseFloat(appliance.kwh.toFixed(2)),
        cost: parseFloat(appliance.cost.toFixed(2)),
        fullName: appliance.name,
      }))
  }, [appliancesWithDetails])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-[#0f2744] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size={38} dark subtitle="Appliance Energy Calculator" />
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/" className="text-blue-200 hover:text-white transition-colors">Home</Link>
              <Link to="/calculator" className="bg-[#2d7d46] hover:bg-[#246838] text-white px-4 py-1.5 rounded-full text-xs font-medium transition-colors">
                ← Tariff Calculator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Add/Edit appliances */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add/Edit form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-lg font-bold text-[#0f2744] mb-4">
                {isEditing ? 'Edit Appliance' : 'Add New Appliance'}
              </h2>
              
              <div className="space-y-4">
                {/* Preset selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quick Select Preset
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                    value={selectedPreset}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value)
                      if (!isNaN(idx)) handleSelectPreset(idx)
                    }}
                  >
                    <option value="">-- Select a common appliance --</option>
                    {PRESET_APPLIANCES.map((preset, idx) => (
                      <option key={idx} value={idx}>
                        {preset.name} ({preset.wattage}W)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appliance Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                    placeholder="e.g., Air Conditioner, Refrigerator"
                    value={editingAppliance.name}
                    onChange={(e) => setEditingAppliance({...editingAppliance, name: e.target.value})}
                  />
                </div>

                {/* Wattage input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wattage (W) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                    placeholder="Power consumption in watts"
                    value={editingAppliance.wattage || ''}
                    onChange={(e) => setEditingAppliance({...editingAppliance, wattage: parseInt(e.target.value) || 0})}
                  />
                </div>

                {/* Quantity, hours, days inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                      value={editingAppliance.quantity || ''}
                      onChange={(e) => setEditingAppliance({...editingAppliance, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours/Day
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                      placeholder="e.g., 4.5"
                      value={editingAppliance.hoursPerDay || ''}
                      onChange={(e) => setEditingAppliance({...editingAppliance, hoursPerDay: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Days/Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2d7d46] focus:border-[#2d7d46] outline-none"
                      value={editingAppliance.daysPerMonth || ''}
                      onChange={(e) => setEditingAppliance({...editingAppliance, daysPerMonth: parseInt(e.target.value) || 30})}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 bg-[#2d7d46] text-white py-2 rounded-lg font-medium hover:bg-[#246838] transition-colors text-sm"
                    onClick={handleAddOrUpdateAppliance}
                  >
                    {isEditing ? 'Update Appliance' : 'Add Appliance'}
                  </button>
                  {isEditing && (
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => {
                        setEditingAppliance(DEFAULT_APPLIANCE)
                        setIsEditing(null)
                        setSelectedPreset('')
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Total summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-lg font-bold text-[#0f2744] mb-4">Total Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Appliances Count:</span>
                  <span className="font-semibold">{appliances.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Energy:</span>
                  <span className="font-semibold">{totalKWh.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Monthly Cost:</span>
                  <span className="font-semibold text-[#2d7d46]">{formatINR(totalCost)}</span>
                </div>
                <div className="pt-2">
                  <button
                    className="w-full py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                    onClick={handleClearAll}
                    disabled={appliances.length === 0}
                  >
                    Clear All Appliances
                  </button>
                </div>
              </div>
            </div>

            {/* Energy saving tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-lg font-bold text-[#0f2744] mb-4">Energy Saving Tips</h3>
              <div className="space-y-3">
                {ENERGY_SAVING_TIPS.slice(0, 3).map((tip, idx) => (
                  <div key={idx} className="border-l-4 border-[#2d7d46] pl-3 py-1">
                    <div className="font-medium text-sm text-gray-800">{tip.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{tip.description}</div>
                    <div className="text-xs text-[#2d7d46] font-medium mt-1">{tip.savings}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — List and chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appliances list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0f2744]">Your Appliances</h2>
                <div className="text-sm text-gray-500">
                  {appliances.length === 0 ? 'No appliances added yet' : `${appliances.length} appliance(s)`}
                </div>
              </div>

              {appliances.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">🔌</div>
                  <p className="mb-2">No appliances added yet</p>
                  <p className="text-sm">Add appliances above to start tracking energy consumption</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appliancesWithDetails.map((appliance) => (
                    <div
                      key={appliance.id}
                      className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{appliance.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {appliance.wattage}W × {appliance.quantity} units × {appliance.hoursPerDay}h/day × {appliance.daysPerMonth} days/month
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">{appliance.kwh.toFixed(2)} kWh</div>
                          <div className="text-sm text-[#2d7d46] font-medium">{formatINR(appliance.cost)}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            onClick={() => handleEditAppliance(appliance)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            onClick={() => handleDeleteAppliance(appliance.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-lg font-bold text-[#0f2744] mb-4">Energy Consumption by Appliance</h2>
              {chartData.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📊</div>
                  <p>Add appliances to see the energy consumption chart</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        angle={0}
                        textAnchor="middle"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{ value: 'kWh', angle: -90, position: 'insideLeft', offset: -5 }}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'kwh') return [`${value} kWh`, 'Energy']
                          if (name === 'cost') return [formatINR(value as number), 'Cost']
                          return value
                        }}
                        labelFormatter={(label, items) => {
                          const item = items?.[0]?.payload
                          return item?.fullName || label
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="kwh"
                        name="Monthly Energy (kWh)"
                        fill="#2d7d46"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Additional tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-lg font-bold text-[#0f2744] mb-4">Understanding Your Energy Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">💡</div>
                  <h4 className="font-medium text-gray-800 mb-2">How Calculations Work</h4>
                  <p className="text-sm text-gray-600">
                    Energy (kWh) = (Wattage × Quantity × Hours/Day × Days/Month) ÷ 1000. Costs use the Basic Flat tariff rate of ₹7.20 per kWh.
                  </p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">📝</div>
                  <h4 className="font-medium text-gray-800 mb-2">Data Persistence</h4>
                  <p className="text-sm text-gray-600">
                    Your appliance data is saved automatically in your browser's localStorage. It will remain even after closing the browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>WattWise — Appliance Energy Calculator · Demo rates (₹7.20/kWh)</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gray-600">Home</Link>
            <Link to="/calculator" className="hover:text-gray-600">Tariff Calculator</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}