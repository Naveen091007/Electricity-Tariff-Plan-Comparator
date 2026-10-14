import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CalculatorPage from './pages/CalculatorPage';
import ApplianceCalculator from './pages/ApplianceCalculator';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/appliances" element={<ApplianceCalculator />} />
      </Routes>
    </Router>
  );
}