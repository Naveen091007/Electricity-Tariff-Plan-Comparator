import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatINR } from '../utils/currency'
import Logo from '../components/Logo'
import { DISCLAIMER } from '../data/tariffs'

// ── Sub-components ───────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: string
  circleColor: string
  title: string
  description: string
}

function FeatureCard({ icon, circleColor, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-4"
        style={{ background: circleColor }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#0f2744] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full py-4 text-left flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-800">{question}</span>
        <span className="text-gray-400 text-xl flex-shrink-0 ml-2">{isOpen ? '−' : '+'}</span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div className="pb-4 px-2 text-gray-600 text-sm leading-relaxed">{answer}</div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features: FeatureCardProps[] = [
    {
      icon: '⚖️',
      circleColor: '#dbeafe',
      title: 'Smart Tariff Comparison',
      description:
        'Compare electricity plans side-by-side with full cost breakdowns across peak, normal, and off-peak periods.',
    },
    {
      icon: '🔌',
      circleColor: '#dcfce7',
      title: 'Appliance Energy Detective',
      description:
        'Identify which appliances drive your bill and calculate their exact monthly energy cost.',
    },
    {
      icon: '⏰',
      circleColor: '#fef9c3',
      title: 'Smart Savings Simulator',
      description:
        'Simulate how shifting load to off-peak hours or switching plans cuts your monthly bill.',
    },
    {
      icon: '💰',
      circleColor: '#fce7f3',
      title: 'Monthly Budget Guardian',
      description:
        'Set a budget target and get alerted when your estimated bill approaches the limit.',
    },
    {
      icon: '📅',
      circleColor: '#e0e7ff',
      title: 'Bill History',
      description:
        'Track month-over-month bills, spot trends, and see if your changes are paying off.',
    },
    {
      icon: '📄',
      circleColor: '#f3e8ff',
      title: 'PDF Savings Report',
      description:
        'Download a professional report showing your bill breakdown and savings opportunities.',
    },
  ]

  const faqs: FAQItemProps[] = [
    {
      question: 'What is a peak-hour tariff?',
      answer:
        'Peak-hour tariffs are higher electricity rates charged during periods of high demand (typically morning and evening hours). These rates help utilities manage grid load by encouraging consumers to shift usage to off-peak periods.',
    },
    {
      question: 'What are normal and off-peak hours?',
      answer:
        'Normal hours are standard daytime rates. Off-peak hours (usually late night to early morning) have significantly lower rates to encourage usage when demand is low. Different utilities define these periods differently.',
    },
    {
      question: 'How does WattWise calculate my bill?',
      answer:
        'WattWise multiplies your consumption (in kWh) by the applicable rate for each time period, then adds any fixed monthly charges. The calculations are transparent and follow standard utility billing practices.',
    },
    {
      question: 'Are the electricity rates official?',
      answer:
        'The rates shown are illustrative demonstration values for educational purposes only. For actual billing, you should use verified rates from your electricity distribution company.',
    },
    {
      question: 'Is my data stored anywhere?',
      answer:
        'All data stays in your browser\'s localStorage — nothing is sent to any server. You can clear it at any time using the Reset button in the app.',
    },
  ]

  const benefits = [
    'Instant side-by-side bill comparison across all tariff plans',
    'Detailed cost breakdown: fixed charge + peak + normal + off-peak',
    'Identify high-consumption appliances impacting your bill',
    'Simulate savings from off-peak shifting or plan switching',
    'Track monthly budget with visual progress bar',
    'Download a professional PDF savings report',
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <header className="bg-[#0f2744] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size={38} dark subtitle="Smart Electricity Management" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                Benefits
              </a>
              <a href="#faq" className="text-sm font-medium text-blue-200 hover:text-white transition-colors">
                FAQ
              </a>
              <Link
                to="/appliances"
                className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
              >
                Appliances
              </Link>
              <Link
                to="/calculator"
                className="bg-[#2d7d46] hover:bg-[#246838] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
              >
                Calculate My Bill
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-2xl text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-sm font-medium text-blue-200 hover:text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-blue-200 hover:text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#benefits"
                  className="text-sm font-medium text-blue-200 hover:text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Benefits
                </a>
                <a
                  href="#faq"
                  className="text-sm font-medium text-blue-200 hover:text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                <Link
                  to="/appliances"
                  className="text-sm font-medium text-blue-200 hover:text-white py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Appliances
                </Link>
                <Link
                  to="/calculator"
                  className="bg-[#2d7d46] hover:bg-[#246838] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Calculate My Bill
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#0f2744] text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: copy */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Your Electricity Bill,<br />Smarter.
                </h1>
                <p className="text-lg text-blue-200 mb-8 leading-relaxed">
                  Compare tariff plans, track your usage, and find the smartest way to save every
                  month.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/calculator"
                    className="bg-white text-[#0f2744] hover:bg-gray-100 px-6 py-3 rounded-full text-center font-semibold transition-colors shadow-lg"
                  >
                    Calculate My Bill
                  </Link>
                  <a
                    href="#features"
                    className="border-2 border-white hover:bg-white/10 px-6 py-3 rounded-full text-center font-semibold transition-colors"
                  >
                    Explore Features
                  </a>
                </div>
              </div>

              {/* Right: dashboard preview card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <p className="text-xs text-blue-200 mb-3 uppercase tracking-wide">Sample Preview</p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Monthly Bill</div>
                    <div className="text-2xl font-bold">{formatINR(1875)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Best Plan</div>
                    <div className="text-lg font-semibold">Time-of-Use</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Monthly Saving</div>
                    <div className="text-xl font-bold" style={{ color: '#34d399' }}>
                      {formatINR(320)}
                    </div>
                  </div>
                  {/* CSS mini bar chart — no Recharts */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-3">Usage Pattern</div>
                    <div className="h-10 flex items-end gap-1">
                      <div className="flex-1 bg-red-400 rounded-t" style={{ height: '70%' }} />
                      <div className="flex-1 bg-yellow-400 rounded-t" style={{ height: '100%' }} />
                      <div className="flex-1 rounded-t" style={{ height: '35%', background: '#34d399' }} />
                    </div>
                    <div className="flex justify-between text-xs text-blue-200 mt-1">
                      <span>Peak</span>
                      <span>Normal</span>
                      <span>Off-peak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0f2744] mb-4">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to understand and optimize your electricity costs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <FeatureCard key={i} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0f2744] mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Three simple steps to find your optimal electricity plan
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-6 left-1/4 right-1/4 h-0.5 bg-[#2d7d46] z-0" />
              {[
                {
                  n: 1,
                  title: 'Enter Your Consumption',
                  desc: 'Input your peak, normal, and off-peak electricity usage in kilowatt-hours.',
                },
                {
                  n: 2,
                  title: 'Compare Tariff Plans',
                  desc: 'See detailed cost breakdowns across different tariff structures side-by-side.',
                },
                {
                  n: 3,
                  title: 'Find Best Plan & Save',
                  desc: 'Get personalised recommendations and explore practical savings opportunities.',
                },
              ].map(({ n, title, desc }) => (
                <div key={n} className="relative flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#2d7d46] text-white flex items-center justify-center text-xl font-bold mb-4 z-10">
                    {n}
                  </div>
                  <h3 className="text-lg font-semibold text-[#0f2744] mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/calculator"
                className="inline-block bg-[#2d7d46] hover:bg-[#246838] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm"
              >
                Start Calculating Now
              </Link>
            </div>
          </div>
        </section>

        {/* ── Benefits ───────────────────────────────────────────────────────── */}
        <section id="benefits" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0f2744] mb-4">Key Benefits</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Why WattWise helps you make smarter electricity decisions
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#2d7d46] mt-0.5 font-bold flex-shrink-0">✓</span>
                  <span className="text-gray-700 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0f2744] mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Common questions about WattWise and electricity tariffs</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              {faqs.map((faq, i) => (
                <FAQItem key={i} {...faq} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-[#0f2744] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Electricity Costs?</h2>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Start comparing tariffs and discover how much you could save on your electricity bill.
            </p>
            <Link
              to="/calculator"
              className="inline-block bg-white text-[#0f2744] hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg transition-colors shadow-lg"
            >
              Calculate My Savings Now
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0f2744] text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand */}
            <div>
              <div className="mb-4">
                <Logo size={34} dark />
              </div>
              <p className="text-sm text-blue-300">
                Smart electricity cost management platform for Indian households.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="font-semibold text-base mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-blue-300 hover:text-white text-sm transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/calculator"
                    className="text-blue-300 hover:text-white text-sm transition-colors"
                  >
                    Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/appliances"
                    className="text-blue-300 hover:text-white text-sm transition-colors"
                  >
                    Appliances
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Features */}
            <div>
              <h3 className="font-semibold text-base mb-4">Features</h3>
              <ul className="space-y-2">
                {['Smart Tariff Comparison', 'Appliance Energy Detective', 'Savings Simulator', 'PDF Report'].map(
                  (f) => (
                    <li key={f}>
                      <span className="text-blue-300 text-sm">{f}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Col 4: Disclaimer */}
            <div>
              <h3 className="font-semibold text-base mb-4">Disclaimer</h3>
              <p className="text-xs text-blue-300 leading-relaxed">{DISCLAIMER}</p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-blue-400">
            <p>WattWise — Smart Electricity Cost &amp; Savings Platform · Built with React + TypeScript + Tailwind CSS</p>
            <p className="mt-2">© {new Date().getFullYear()} Educational Project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
