import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';

// Icons using emoji for now (we can replace with Lucide icons if available)
const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="relative">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-sage text-white flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full py-4 text-left flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-800">{question}</span>
        <span className="text-gray-400 text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pb-4 px-2 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    { icon: '⚖️', title: 'Smart Tariff Comparison', description: 'Compare different electricity tariff plans side-by-side with detailed breakdown of costs.' },
    { icon: '🔌', title: 'Appliance Energy Calculator', description: 'Calculate energy consumption of individual appliances to understand their impact on your bill.' },
    { icon: '⏰', title: 'Peak and Off-Peak Savings Simulator', description: 'Simulate how shifting usage to off-peak hours can reduce your electricity costs.' },
    { icon: '💰', title: 'Monthly Budget Tracker', description: 'Set electricity budget goals and track your actual consumption against them.' },
    { icon: '📈', title: 'Bill Forecasting', description: 'Project your future electricity bills based on historical usage patterns.' },
    { icon: '📋', title: 'Downloadable Savings Reports', description: 'Generate and download detailed reports showing potential savings opportunities.' },
  ];

  const steps = [
    { number: 1, title: 'Enter Your Consumption', description: 'Input your peak, normal, and off-peak electricity usage in kilowatt-hours.' },
    { number: 2, title: 'Compare Tariff Plans', description: 'See detailed cost breakdowns across different tariff structures.' },
    { number: 3, title: 'Find Best Plan & Save', description: 'Get personalized recommendations and explore practical savings opportunities.' },
  ];

  const benefits = [
    'Understand electricity costs clearly with transparent breakdowns',
    'Compare different pricing structures across multiple plans',
    'Identify high-consumption appliances affecting your bill',
    'Explore potential savings through usage pattern optimization',
    'Plan your monthly electricity budget with accurate forecasts',
  ];

  const faqs = [
    {
      question: 'What is a peak-hour tariff?',
      answer: 'Peak-hour tariffs are higher electricity rates charged during periods of high demand (typically daytime hours). These rates help utilities manage grid load by encouraging consumers to shift usage to off-peak periods.'
    },
    {
      question: 'What are normal and off-peak hours?',
      answer: 'Normal hours are standard daytime rates. Off-peak hours (usually late night to early morning) have significantly lower rates to encourage usage when demand is low. Different utilities define these periods differently.'
    },
    {
      question: 'How does WattWise calculate my bill?',
      answer: 'WattWise calculates bills by multiplying your consumption (in kWh) by the applicable rates for each time period, then adding any fixed monthly charges. The calculations are transparent and follow standard utility billing practices.'
    },
    {
      question: 'Are the electricity rates official?',
      answer: 'The rates shown are illustrative demonstration values for educational purposes. For actual billing calculations, you should use verified rates from your electricity distribution company.'
    },
    {
      question: 'How accurate are the bill forecasts?',
      answer: 'Forecasts are based on the consumption patterns you provide and the tariff rates configured. Accuracy depends on how closely your actual usage matches the input patterns and whether official tariff rates are used.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header with Navigation */}
      <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h1 className="text-xl font-bold tracking-tight">WattWise</h1>
                <p className="text-xs text-blue-200 mt-0.5">Smart Electricity Management</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-sage-light transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-sage-light transition-colors">How It Works</a>
              <a href="#benefits" className="text-sm font-medium hover:text-sage-light transition-colors">Benefits</a>
              <a href="#faq" className="text-sm font-medium hover:text-sage-light transition-colors">FAQ</a>
              <Link to="/calculator" className="bg-sage hover:bg-sage-light text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                Calculate My Bill
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-navy-light pt-4">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm font-medium hover:text-sage-light transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-sm font-medium hover:text-sage-light transition-colors py-2" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                <a href="#benefits" className="text-sm font-medium hover:text-sage-light transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Benefits</a>
                <a href="#faq" className="text-sm font-medium hover:text-sage-light transition-colors py-2" onClick={() => setIsMenuOpen(false)}>FAQ</a>
                <Link to="/calculator" className="bg-sage hover:bg-sage-light text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm text-center" onClick={() => setIsMenuOpen(false)}>
                  Calculate My Bill
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Take Control of Your<br />Electricity Bill
                </h1>
                <p className="text-lg text-blue-200 mb-8 leading-relaxed">
                  Compare electricity tariffs, understand your energy usage, and discover smarter ways to save every month.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/calculator" className="bg-white text-navy hover:bg-gray-100 px-6 py-3 rounded-full text-center font-semibold transition-colors shadow-lg">
                    Calculate My Bill
                  </Link>
                  <a href="#features" className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-full text-center font-semibold transition-colors">
                    Explore Features
                  </a>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-4">Sample Dashboard Preview</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Estimated Monthly Bill</div>
                    <div className="text-2xl font-bold">{formatINR(1875)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Recommended Plan</div>
                    <div className="text-lg font-semibold">Time-of-Use Tariff</div>
                    <div className="text-sm text-blue-200 mt-1">Best for mixed usage patterns</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Monthly Savings Potential</div>
                    <div className="text-xl font-bold text-sage-light">{formatINR(320)}</div>
                    <div className="text-xs text-blue-200 mt-1">vs. Basic Flat Rate</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm text-blue-200 mb-1">Consumption Pattern</div>
                    <div className="flex items-end h-12 gap-1 mt-2">
                      <div className="flex-1 bg-red-400 rounded-t" style={{ height: '80%' }}></div>
                      <div className="flex-1 bg-yellow-400 rounded-t" style={{ height: '100%' }}></div>
                      <div className="flex-1 bg-green-400 rounded-t" style={{ height: '40%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-200 mt-2">
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

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">Powerful Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to understand and optimize your electricity costs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple three-step process to find your optimal electricity plan
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-6 left-1/4 right-1/4 h-0.5 bg-sage -translate-y-1/2 z-0"></div>
              {steps.map((step, index) => (
                <StepCard key={index} {...step} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/calculator" className="inline-block bg-sage hover:bg-sage-light text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm">
                Start Calculating Now
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">Key Benefits</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Why WattWise helps you make smarter electricity decisions
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="bg-sage-pale rounded-2xl p-8 border border-sage/20">
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-sage mt-1">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Common questions about WattWise and electricity tariffs</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              {faqs.map((faq, index) => (
                <FAQItem key={index} {...faq} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-navy text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Electricity Costs?</h2>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
              Start comparing tariffs and discover how much you could save on your electricity bill.
            </p>
            <Link to="/calculator" className="inline-block bg-white text-navy hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg transition-colors shadow-lg">
              Calculate My Savings Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold">WattWise</h2>
              </div>
              <p className="text-sm text-blue-300">
                Smart electricity cost management platform for Indian households.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-blue-300 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link to="/calculator" className="text-blue-300 hover:text-white text-sm transition-colors">Calculator</Link></li>
                <li><a href="#features" className="text-blue-300 hover:text-white text-sm transition-colors">Features</a></li>
                <li><a href="#faq" className="text-blue-300 hover:text-white text-sm transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-4">Important Information</h3>
              <div className="text-sm text-blue-300 space-y-2">
                <p>
                  WattWise is a demonstration application for educational purposes. 
                  The tariff rates shown are illustrative examples and not official electricity board rates.
                </p>
                <p>
                  For actual billing calculations, always refer to verified rates from your electricity distribution company.
                  This tool helps you understand tariff structures and potential savings opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-navy-light mt-8 pt-8 text-center text-sm text-blue-400">
            <p>WattWise — Smart Electricity Cost & Savings Platform · Built with React + TypeScript + Tailwind CSS</p>
            <p className="mt-2">© {new Date().getFullYear()} Educational Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}