import { test, expect } from '@playwright/test';

test('generates and renders a forecast summary', async ({ page }) => {
  await page.route('**/api/forecast', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        summary: 'Weekend foot traffic should spike citrus and ginger demand.',
        forecast: [
          {
            ingredient: 'Spinach',
            days: [
              { date: '2026-04-06', units: 12, risk: 'green' },
              { date: '2026-04-07', units: 14, risk: 'yellow' }
            ]
          },
          {
            ingredient: 'Banana',
            days: [
              { date: '2026-04-06', units: 18, risk: 'green' },
              { date: '2026-04-07', units: 16, risk: 'green' }
            ]
          },
          {
            ingredient: 'Mango',
            days: [
              { date: '2026-04-06', units: 10, risk: 'red' },
              { date: '2026-04-07', units: 8, risk: 'red' }
            ]
          }
        ],
        orderSheet: [
          { ingredient: 'Spinach', qty: 24, unit: 'lb', urgency: 'normal' },
          { ingredient: 'Mango', qty: 18, unit: 'cases', urgency: 'high' }
        ]
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Generate 7-Day Forecast/i }).click();

  await expect(page.getByText('AI Analysis')).toBeVisible();
  await expect(page.getByText('Weekend foot traffic should spike citrus and ginger demand.')).toBeVisible();
  await expect(page.getByText('7-Day Demand Forecast')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order Sheet' })).toBeVisible();
});

test('context tab remains usable before generating', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Context Factors/i }).click();
  await expect(page.getByText(/Context Factors/i).first()).toBeVisible();
  await page.getByRole('button', { name: /Sales Data/i }).click();
  await expect(page.getByRole('button', { name: /Generate 7-Day Forecast/i })).toBeVisible();
});

test('server failures surface the error banner', async ({ page }) => {
  await page.route('**/api/forecast', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'forecast unavailable' }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /Generate 7-Day Forecast/i }).click();
  await expect(page.getByText('Error: Server error: 500')).toBeVisible();
});


