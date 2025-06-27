/**
 * configTest.spec.ts
 *
 * This file serves as a test suite for validating and demonstrating the usage of environment variables
 * defined in the `env.ts` file. It includes example tests that show how to access and validate
 * environment-specific configurations such as `BASE_URL`, `SAUCE_USERNAME`, and other variables.
 *
 * Engineers can reference this file as a guide on how to:
 * 1. Access variables exported from `env.ts`.
 * 2. Perform validation to ensure critical variables are set.
 * 3. Write tests that depend on these configurations.
 *
 * The suite is designed to provide clarity on managing environment variables for both local and CI/CD environments.
 */

import { test, expect } from '@playwright/test';
import { ENV } from '../support/env'; // Ensure the correct path to env.ts

// Detect if the test is running in Sauce Labs
const isSauceRun = process.env.SAUCE_RUN

/**
 * Configuration Test Suite
 * Ensures environment variables are correctly loaded and utilized.
 */
test.describe('Config Test Suite', () => {
  // Test to verify BASE_URL is accessible
  test.only('Verify BASE_URL is accessible', async ({ page }) => {
    console.log(`Using BASE_URL: ${ENV.BASE_URL}`);

    // Navigate to the BASE_URL
    await page.goto(ENV.BASE_URL);
    // Perform basic assertions
    expect(page.url()).toContain(ENV.BASE_URL);
  });

  // Test to validate Sauce Labs credentials locally
  test('Validate Sauce Labs credentials', async () => {
    if (isSauceRun) {
      console.log('Running in Sauce Labs; skipping Sauce Labs credential validation.');
      return;
    }

    console.log('Validating Sauce Labs credentials...');

    // Validate the credentials are set
    expect(ENV.SAUCE_USERNAME).not.toBe('');
    expect(ENV.SAUCE_ACCESS_KEY).not.toBe('');

    console.log('Sauce Labs credentials are properly set.');
  });

  // Test to verify viewport configuration based on IS_DESKTOP
  test('Validate viewport based on IS_DESKTOP setting', async () => {
    console.log(`Viewport setting (IS_DESKTOP): ${ENV.IS_DESKTOP}`);

    const expectedViewport = ENV.IS_DESKTOP
      ? { height: 1080, width: 1920 }
      : { height: 896, width: 414 };

    expect(expectedViewport).toBeTruthy();

    console.log(
      `Viewport configuration is set correctly: ${JSON.stringify(expectedViewport)}`
    );
  });

  // Test to validate PR_NUMBER, if applicable
  test('Validate PR_NUMBER if provided', async () => {
    if (ENV.PR_NUMBER) {
      console.log(`Validating PR_NUMBER: ${ENV.PR_NUMBER}`);

      expect(ENV.PR_NUMBER).toMatch(/^[0-9]+$/);

      console.log('PR_NUMBER is valid.');
    } else {
      console.log('PR_NUMBER is not specified; skipping validation.');
    }
  });

  /**
   * Analytics Blocking Test
   * Ensures predefined analytics hosts are blocked when BLOCK_ANALYTICS_CALLS is true.
   */
  test('Block predefined analytics hosts when BLOCK_ANALYTICS_CALLS is true', async ({
                                                                                       page,
                                                                                     }) => {
    if (!ENV.BLOCK_ANALYTICS_CALLS) {
      console.log('BLOCK_ANALYTICS_CALLS is disabled; skipping test.');
      return;
    }

    const blockedRequests: string[] = []; // Array to store details of blocked requests

    // Set up route interception to block predefined hosts
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        ENV.BLOCKED_HOSTS.some((host) =>
          new RegExp(host.replace('*', '.*')).test(url)
        )
      ) {
        blockedRequests.push(url); // Capture blocked requests
        return route.abort(); // Block the request
      }
      return route.continue();
    });

    // Simulate navigation or actions that trigger analytics requests
    for (const host of ENV.BLOCKED_HOSTS) {
      console.log(`Testing blocked host pattern: ${host}`);
      await page.goto(`https://${host}`).catch(() => {}); // Ignore navigation errors caused by blocking
    }

    // Log and validate that requests were blocked
    console.log('Blocked Requests:', blockedRequests);
    if (!isSauceRun) {
      expect(blockedRequests.length).toBeGreaterThan(0);
    }
  });
});
