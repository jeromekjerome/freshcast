const WEATHER_OPTIONS = ['Sunny & Warm', 'Partly Cloudy', 'Rainy', 'Cold', 'Hot & Humid'];

export default function ContextTags({ contextFactors, setContextFactors }) {
  const update = (key, value) => setContextFactors(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">Weather Forecast</p>
        <div className="flex flex-wrap gap-1.5">
          {WEATHER_OPTIONS.map(w => (
            <button key={w} onClick={() => update('weather', w)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                contextFactors.weather === w
                  ? 'bg-amber-500 border-amber-400 text-white'
                  : 'bg-amber-950/30 border-amber-800/30 text-amber-400 hover:border-amber-600/40'
              }`}>
              {w}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">Nearby Events</p>
        <input
          value={contextFactors.events || ''}
          onChange={e => update('events', e.target.value)}
          placeholder="e.g. NYC Marathon Saturday"
          className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-800 focus:outline-none focus:border-amber-600/50"
        />
      </div>
      <div>
        <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">Holidays / Promotions</p>
        <input
          value={contextFactors.notes || ''}
          onChange={e => update('notes', e.target.value)}
          placeholder="e.g. Labor Day, new açaí promo launching"
          className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-100 placeholder-amber-800 focus:outline-none focus:border-amber-600/50"
        />
      </div>
    </div>
  );
}
