import { useState } from 'react';
import ContextTags from './ContextTags.jsx';

export default function DataInput({ salesData, setSalesData, ingredients, setIngredients, contextFactors, setContextFactors, onGenerate, loading }) {
  const [activeSection, setActiveSection] = useState('data'); // 'data' | 'context'

  // Get dates (last 14 days)
  const dates = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const getValue = (ingredient, date) => {
    const entry = salesData.find(d => d.ingredient === ingredient && d.date === date);
    return entry ? entry.units : 0;
  };

  const setValue = (ingredient, date, value) => {
    const units = parseInt(value) || 0;
    setSalesData(prev => {
      const filtered = prev.filter(d => !(d.ingredient === ingredient && d.date === date));
      return [...filtered, { ingredient, date, units }];
    });
  };

  const handleIngredientName = (index, name) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = name;
      return updated;
    });
    setSalesData(prev => prev.map(d => d.ingredient === ingredients[index] ? { ...d, ingredient: name } : d));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayOfWeek = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isWeekend = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDay() === 0 || d.getDay() === 6;
  };

  return (
    <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl overflow-hidden">
      {/* Panel header */}
      <div className="flex border-b border-amber-900/30">
        {['data', 'context'].map(tab => (
          <button key={tab} onClick={() => setActiveSection(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
              activeSection === tab
                ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500'
                : 'text-amber-700 hover:text-amber-500'
            }`}>
            {tab === 'data' ? '📊 Sales Data (14 Days)' : '🌤️ Context Factors'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeSection === 'data' && (
          <div>
            <p className="text-amber-700 text-xs mb-3">Edit ingredient names and daily units sold. Weekends highlighted.</p>
            <div className="overflow-x-auto -mx-2">
              <table className="text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-amber-600 font-semibold min-w-[90px] sticky left-0" style={{ backgroundColor: '#1a1005' }}>Ingredient</th>
                    {dates.map(date => (
                      <th key={date} className={`px-1 py-1 text-center font-medium min-w-[40px] ${isWeekend(date) ? 'text-amber-400' : 'text-amber-700'}`}>
                        <div>{getDayOfWeek(date)}</div>
                        <div className="font-normal">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, idx) => (
                    <tr key={idx} className="border-t border-amber-900/20">
                      <td className="px-2 py-1 sticky left-0" style={{ backgroundColor: '#1a1005' }}>
                        <input
                          value={ing}
                          onChange={e => handleIngredientName(idx, e.target.value)}
                          className="bg-transparent text-amber-300 font-medium w-full focus:outline-none focus:text-amber-100 min-w-[80px]"
                        />
                      </td>
                      {dates.map(date => (
                        <td key={date} className={`px-1 py-1 ${isWeekend(date) ? 'bg-amber-900/10' : ''}`}>
                          <input
                            type="number"
                            min="0"
                            value={getValue(ing, date)}
                            onChange={e => setValue(ing, date, e.target.value)}
                            className="w-10 text-center bg-amber-950/40 border border-amber-900/30 rounded text-amber-200 py-0.5 focus:outline-none focus:border-amber-600/50 text-xs"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'context' && (
          <ContextTags contextFactors={contextFactors} setContextFactors={setContextFactors} />
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 disabled:bg-amber-900/40 disabled:text-amber-800 text-dark font-bold text-sm hover:bg-amber-400 transition-all active:scale-[0.99]"
        >
          {loading ? '⏳ Generating Forecast...' : '🔮 Generate 7-Day Forecast →'}
        </button>
      </div>
    </div>
  );
}
