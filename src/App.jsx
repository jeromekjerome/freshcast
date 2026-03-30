import { useState, useEffect } from 'react';
import { INGREDIENTS, SAMPLE_SALES, DEFAULT_CONTEXT } from './data/sampleData.js';
import DataInput from './components/DataInput.jsx';
import ForecastOutput from './components/ForecastOutput.jsx';
import useForecast from './hooks/useForecast.js';

export default function App() {
  const [salesData, setSalesData] = useState(SAMPLE_SALES);
  const [ingredients, setIngredients] = useState(INGREDIENTS);
  const [contextFactors, setContextFactors] = useState(DEFAULT_CONTEXT);
  const { forecast, loading, error, generate } = useForecast();

  useEffect(() => {
    const sid = sessionStorage.getItem('sid') || Math.random().toString(36).slice(2);
    sessionStorage.setItem('sid', sid);
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_visit', sessionId: sid }),
    }).catch(() => {});
  }, []);

  const handleGenerate = () => {
    generate(salesData, ingredients, contextFactors);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0a02' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <span className="font-bold text-amber-400 text-lg">FreshCast</span>
          <span className="hidden sm:inline text-xs text-amber-800 font-medium uppercase tracking-widest ml-2">Demand Forecasting</span>
        </div>
        <span className="text-xs text-amber-800">AI-Powered by Claude</span>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Data Input */}
          <DataInput
            salesData={salesData}
            setSalesData={setSalesData}
            ingredients={ingredients}
            setIngredients={setIngredients}
            contextFactors={contextFactors}
            setContextFactors={setContextFactors}
            onGenerate={handleGenerate}
            loading={loading}
          />

          {/* Right: Forecast Output */}
          <div>
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                Error: {error}
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl">
                <div className="w-12 h-12 rounded-full border-4 border-amber-900 border-t-amber-400 animate-spin" />
                <p className="text-amber-600 text-sm">Analyzing sales patterns...</p>
                <p className="text-amber-800 text-xs">Claude is reviewing your 14-day history</p>
              </div>
            )}
            {!loading && forecast && <ForecastOutput forecast={forecast} ingredients={ingredients} />}
            {!loading && !forecast && !error && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-amber-950/10 border border-dashed border-amber-900/30 rounded-2xl">
                <span className="text-4xl">📊</span>
                <p className="text-amber-700 text-sm text-center">Your 7-day forecast will appear here<br />after you click Generate Forecast</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
