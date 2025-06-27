import { defineConfig } from '@playwright/test';
import path from 'path';
import { getBrowserProjects } from './support/baseSetup';
import { fileURLToPath } from 'url';
import { ENV } from './support/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isSauceRun = process.env.SAUCE_RUN === 'true'; // Check if running on Sauce Labs
const browser = process.env.BROWSER; 

export default defineConfig({
  ...(isSauceRun
    ? { } // Exclude projects for Sauce Labs
    : {
      // Based on browser name this function will return configuration. 
      projects: getBrowserProjects(browser),
    }),

  reporter: [
    ['./support/my-reporter.ts'], // Your custom reporter
    ['list'], // Console output
    [
      'junit',
      {
        outputFile: path.join(__dirname, 'results/test-results.xml'),
        filterTests: (test: { title: string; }) => {
          const hasTestRailMapping = /C\d+/.test(test.title);
          if (!hasTestRailMapping) {
            console.warn(`Skipping unmapped test **from XML**, but still executing: ${test.title}`);
          }
          return true; // Let all tests run, but filter them in the report
        },
      },
    ],
    [
      'html',
      {
        outputFolder: path.join(__dirname, 'results'),
        open: 'never', // or 'on-failure' if preferred
      },
    ],
  ],

  retries: isSauceRun ? 0 : ENV.IS_DESKTOP ? 2 : 1,

  testDir: './tests',

  timeout: 900000, // 15 minutes for each test

  expect: {
    timeout: 10000 // 10 seconds for all expect() calls. Default Timeout for expect() is 5 seconds (5000 ms)
  },

  use: {
    headless: false,
    actionTimeout: 30000, // Clicks, fills, etc.
    navigationTimeout: 80000,   // Page loads or redirects
    baseURL: ENV.BASE_URL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'on',   //ENV.BLOCK_ANALYTICS_CALLS ? 'off' : 'on-first-retry',
    video: 'retain-on-failure'
  },
  
});
