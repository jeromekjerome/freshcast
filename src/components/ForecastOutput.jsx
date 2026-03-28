import OrderSheet from './OrderSheet.jsx';

const RISK_STYLE = {
  green:  'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red:    'bg-red-500/20 text-red-400',
};

const RISK_LABEL = { green: '✓', yellow: '⚠', red: '🔴' };

export default function ForecastOutput({ forecast, ingredients }) {
  const { forecast: forecastData, orderSheet, summary } = forecast;

  // Get all unique dates from forecast
  const allDates = forecastData?.[0]?.days?.map(d => d.date) || [];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  const getDayData = (ingredient, date) => {
    const ingForecast = forecastData?.find(f => f.ingredient === ingredient);
    return ingForecast?.days?.find(d => d.date === date) || { units: '—', risk: 'green' };
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      {summary && (
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-2">AI Analysis</p>
          <p className="text-amber-100 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* 7-day forecast table */}
      <div>
        <h3 className="text-white font-bold mb-3">7-Day Demand Forecast</h3>
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-amber-900/30">
                  <th className="px-3 py-2.5 text-left text-amber-600 font-semibold sticky left-0 bg-amber-950 min-w-[90px]">Ingredient</th>
                  {allDates.map(date => {
                    const { day, date: dateLabel } = formatDate(date);
                    return (
                      <th key={date} className="px-2 py-2.5 text-center text-amber-600 font-medium min-w-[58px]">
                        <div>{day}</div>
                        <div className="font-normal text-amber-800">{dateLabel}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => (
                  <tr key={ing} className="border-t border-amber-900/20 hover:bg-amber-900/10 transition-colors">
                    <td className="px-3 py-2.5 text-amber-300 font-medium sticky left-0 bg-amber-950">{ing}</td>
                    {allDates.map(date => {
                      const { units, risk } = getDayData(ing, date);
                      return (
                        <td key={date} className={`px-2 py-2.5 text-center rounded ${RISK_STYLE[risk] || RISK_STYLE.green}`}>
                          <span className="font-bold">{units}</span>
                          <span className="ml-1 text-xs opacity-70">{RISK_LABEL[risk]}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 px-3 py-2 border-t border-amber-900/20 text-xs">
            <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> On track</span>
            <span className="flex items-center gap-1 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Watch</span>
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Waste risk</span>
          </div>
        </div>
      </div>

      {/* Order sheet */}
      {orderSheet && <OrderSheet orderSheet={orderSheet} />}
    </div>
  );
}
