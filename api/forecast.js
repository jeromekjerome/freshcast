// Copyright (c) 2026 Jerome W. Dewald. All rights reserved.
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { salesData, ingredients, contextFactors } = req.body;
  if (!salesData || !ingredients) return res.status(400).json({ error: 'salesData and ingredients required' });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const salesSummary = ingredients.map(ing => {
    const ingData = salesData.filter(d => d.ingredient === ing);
    const totals = ingData.map(d => d.units);
    const avg = totals.length > 0 ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : '0';
    const max = totals.length > 0 ? Math.max(...totals) : 0;
    const min = totals.length > 0 ? Math.min(...totals) : 0;
    const recent7 = ingData.slice(-7).map(d => d.units);
    const trend = recent7.length >= 2
      ? (recent7[recent7.length - 1] - recent7[0]) > 0 ? 'increasing' : 'stable/decreasing'
      : 'unknown';
    return `${ing}: avg=${avg}/day, min=${min}, max=${max}, trend=${trend}, last7days=[${recent7.join(',')}]`;
  }).join('\n');

  const contextStr = contextFactors ? `
Upcoming context:
- Weather: ${contextFactors.weather || 'unknown'}
- Events nearby: ${contextFactors.events || 'none'}
- Holidays next week: ${contextFactors.holidays || 'none'}
- Notes: ${contextFactors.notes || 'none'}` : '';

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: `You are an expert demand forecasting analyst for fresh juice and smoothie bars. You specialize in produce inventory management and waste reduction for high-perishability QSR businesses. You always respond with valid JSON only — no markdown, no preamble.`,
      messages: [{
        role: 'user',
        content: `I run a NYC juice bar and need a 7-day demand forecast.

INGREDIENT SALES HISTORY (last 14 days):
${salesSummary}
${contextStr}

Forecast dates needed: ${next7Days.join(', ')}

Return ONLY valid JSON:
{
  "forecast": [
    {
      "ingredient": "ingredient name",
      "days": [
        { "date": "YYYY-MM-DD", "units": 45, "risk": "green" }
      ]
    }
  ],
  "orderSheet": [
    { "ingredient": "ingredient name", "qty": 50, "unit": "units", "urgency": "normal" }
  ],
  "summary": "2-3 sentence plain-English overview of patterns and key risks"
}

Rules:
- forecast must include ALL ${ingredients.length} ingredients, ALL 7 dates
- risk: "green" within 10% of average, "yellow" 15-30% over-average risk, "red" >30% over-average risk
- orderSheet qty includes 10% buffer above forecasted weekly demand
- urgency: "critical" if red, "high" if yellow, "normal" if green
- units must be whole numbers`
      }]
    });

    const raw = response.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    let forecastData;
    try {
      forecastData = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Failed to parse forecast from AI' });
    }

    res.json(forecastData);
  } catch (err) {
    console.error('Forecast error:', err);
    res.status(500).json({ error: err.message });
  }
}
