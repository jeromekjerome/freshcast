import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4191',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 4191',
    url: 'http://127.0.0.1:4191',
    reuseExistingServer: false,
  },
});

