const URGENCY_STYLE = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  normal: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function OrderSheet({ orderSheet }) {
  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">Order Sheet</h3>
        <button onClick={handlePrint} className="text-sm text-amber-400 border border-amber-800/40 px-3 py-1.5 rounded-xl hover:bg-amber-900/20 transition-all">
          🖨️ Print
        </button>
      </div>

      <div className="print-section bg-amber-950/20 border border-amber-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-amber-900/30">
          <p className="text-amber-500 font-bold text-sm">FRESHCAST ORDER SHEET</p>
          <p className="text-amber-700 text-xs">{today} · 7-day forecast buffer included</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-900/20">
              <th className="px-4 py-2 text-left text-amber-600 text-xs font-semibold uppercase">Ingredient</th>
              <th className="px-4 py-2 text-right text-amber-600 text-xs font-semibold uppercase">Qty</th>
              <th className="px-4 py-2 text-center text-amber-600 text-xs font-semibold uppercase">Priority</th>
            </tr>
          </thead>
          <tbody>
            {orderSheet.map((item, i) => (
              <tr key={i} className="border-b border-amber-900/20 last:border-0">
                <td className="px-4 py-3 text-amber-100 font-medium text-sm">{item.ingredient}</td>
                <td className="px-4 py-3 text-right text-amber-300 text-sm font-bold">{item.qty} <span className="text-amber-700 font-normal">{item.unit}</span></td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${URGENCY_STYLE[item.urgency] || URGENCY_STYLE.normal}`}>
                    {item.urgency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
