/**
 * File: support/baseSetup.ts
 *
 * Purpose:
 * This file defines utility functions used for configuring the Playwright test environment.
 * Specifically, it includes the `getBrowserProjects()` function, which dynamically sets up
 * browser projects based on the value of the `BROWSER` environment variable.
 *
 * Usage:
 * - Called from `playwright.config.ts` to control which browsers are included in the test run.
 * - Supports dynamic configuration for Chromium, Firefox, or WebKit based on `.env` or CI variables.
 *
 * Example:
 *   const projects = getBrowserProjects(process.env.BROWSER);
 *
 * Environment Variable:
 *   BROWSER=chrome | firefox | webkit
 *   (Default: chromium is used if not set or invalid)
 *
 * Notes:
 * - This function is case-insensitive.
 * - You can easily extend this to support multiple browsers or platform-specific configs.
 */


import type { Project } from '@playwright/test';
import { ENV } from './env';

export function getBrowserProjects(browser?: string): Project[] {
  switch (browser?.toLowerCase()) {
    case 'chrome':
    case 'chromium':
      return [
        {
          name: 'Chromium Tests',
          use: { browserName: 'chromium', channel: 'chrome', 
            viewport: ENV.IS_DESKTOP ? null: { height: 896, width: 414 },  // viewport: null Tells Playwright not to resize the browser — use native window size
            launchOptions: {args: ENV.IS_DESKTOP ? ['--start-maximized'] : [],},   //--start-maximized works only on Chromium and needs viewport: null.
            },
        },
      ];
    case 'firefox':
      return [
        {
          name: 'Firefox Tests',
          use: { browserName: 'firefox', viewport: ENV.IS_DESKTOP ? { width: 1920, height: 1080 }: { height: 896, width: 414 }},
        },
      ];
    case 'webkit':
      return [
        {
          name: 'WebKit Tests',
          use: { browserName: 'webkit' , viewport: ENV.IS_DESKTOP ? { width: 1920, height: 1080 }: { height: 896, width: 414 }},
        },
      ];
    default:
      console.warn(
        `Invalid or missing BROWSER environment variable: "${browser}". Defaulting to Chromium.`
      );
      return [
        {
          name: 'Chromium Tests',
          use: { browserName: 'chromium', channel: 'chrome', 
            viewport: ENV.IS_DESKTOP ? null: { height: 896, width: 414 }, // Disables default viewport, opens browser maximized
            launchOptions: {args: ENV.IS_DESKTOP ? ['--start-maximized'] : [],},   //--start-maximized works only on Chromium and needs viewport: null.
            },
        },
      ];
  }
}
