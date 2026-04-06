// Copyright (c) 2026 Jerome W. Dewald. All rights reserved.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/forecast', async (req, res) => {
  const { salesData, ingredients, contextFactors } = req.body;
  if (!salesData || !ingredients) return res.status(400).json({ error: 'salesData and ingredients required' });

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

  const userMessage = `I run a NYC juice bar and need a 7-day demand forecast.

INGREDIENT SALES HISTORY (last 14 days):
${salesSummary}
${contextStr}

Forecast dates needed: ${next7Days.join(', ')}

Analyze the data and return ONLY valid JSON — no markdown, no preamble:
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
  "summary": "2-3 sentence plain-English overview of what you see in the data and key risks/opportunities"
}

Rules:
- forecast must include ALL ${ingredients.length} ingredients
- days must include ALL 7 forecast dates
- risk: "green" if within 10% of average, "yellow" if 15-30% over-average risk, "red" if >30% over-average risk
- orderSheet qty should include a 10% buffer above forecasted demand for the week
- urgency: "critical" if red risk, "high" if yellow, "normal" if green
- units must be whole numbers`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: `You are an expert demand forecasting analyst for fresh juice and smoothie bars. You specialize in produce inventory management and waste reduction for high-perishability QSR businesses. You always respond with valid JSON only.` },
        { role: 'user', content: userMessage }
      ]
    });

    let forecastData;
    try {
      const raw = completion.choices[0].message.content.trim();
      // Strip any accidental markdown code fences
      const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      forecastData = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Failed to parse forecast from AI' });
    }

    res.json(forecastData);
  } catch (err) {
    console.error('Forecast error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3012;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`FreshCast running on port ${PORT}`));
}
export default app;
