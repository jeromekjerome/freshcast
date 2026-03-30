import { useState } from 'react';

function track(event) {
  const sid = sessionStorage.getItem('sid') || Math.random().toString(36).slice(2);
  sessionStorage.setItem('sid', sid);
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, sessionId: sid }),
  }).catch(() => {});
}

export default function useForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (salesData, ingredients, contextFactors) => {
    track('forecast_requested');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesData, ingredients, contextFactors })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      track('forecast_received');
      setForecast(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { forecast, loading, error, generate };
}
