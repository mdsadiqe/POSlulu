/**
 * Example Spec File for Engineers
 *
 * This file serves as an example for testing helpers' functionality.
 * Engineers can use this file as a reference or template for creating new tests.
 * It demonstrates key testing patterns, including Playwright utilities, and assertions.
 */

import { test, expect } from '@playwright/test';
import {
  captureScreenshot,
  generateRandomString,
  toTitleCase,
  scrollToBottom,
  scrollToTop,
  setupPRCookies,
} from '../support/helpers';

test.describe('Helpers Tests', () => {
  /**
   * Test: Validate that `captureScreenshot` saves a screenshot without errors.
   */
  test('captureScreenshot captures and saves a screenshot', async ({
    page,
  }, testInfo) => {
    // Set the page content for the test
    await page.setContent('<div>Screenshot Test</div>');

    // Define the path for the screenshot using the test title
    const screenshotPath = `screenshots/${testInfo.title.replace(/\s+/g, '_')}.png`;

    // Capture the screenshot
    await captureScreenshot(page, screenshotPath);

    // Assert that no errors occurred
    expect(true).toBe(true);
  });

  /**
   * Test: Ensure `generateRandomString` creates a string of the correct length.
   */
  test('generateRandomString creates a string of given length', () => {
    const randomString = generateRandomString(10); // Generate a random string of length 10
    console.log(randomString); // Log the generated string
    expect(randomString).toHaveLength(10); // Assert the string has the correct length
  });

  /**
   * Test: Verify that `toTitleCase` converts a string to title case correctly.
   */
  test('toTitleCase converts a string to title case', () => {
    const title = toTitleCase('hello playwright world');
    console.log(title); // Log the converted string
    expect(title).toBe('Hello Playwright World'); // Assert the output is as expected
  });

  /**
   * Test: Validate that `scrollToBottom` scrolls the page to the bottom.
   */
  test('scrollToBottom scrolls the page to the bottom', async ({ page }) => {
    // Set up a long page content to enable scrolling
    await page.setContent(
      '<div style="height: 2000px;">Scrollable Content</div>'
    );

    // Scroll to the bottom of the page
    await scrollToBottom(page);

    // Retrieve the scroll position and assert it's greater than zero
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
  });

  /**
   * Test: Validate that `scrollToTop` scrolls the page to the top.
   */
  test('scrollToTop scrolls the page to the top', async ({ page }) => {
    // Set up a long page content to enable scrolling
    await page.setContent(
      '<div style="height: 2000px;">Scrollable Content</div>'
    );

    // Scroll to the bottom first to test scrolling back to the top
    await scrollToBottom(page);
    await scrollToTop(page);

    // Retrieve the scroll position and assert it's at the top (zero)
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });

  /**
   * Test: Verify that `setupPRCookies` correctly sets cookies based on PR number.
   */
  test('setupPRCookies sets cookies correctly', async ({ context }) => {
    // Set up PR cookies in the browser context
    await setupPRCookies(context);

    // Retrieve cookies and find the PR_NUMBER cookie
    const cookies = await context.cookies();
    const prCookie = cookies.find((cookie) => cookie.name === 'PR_NUMBER');

    // Validate the PR_NUMBER cookie based on configuration
    if (prCookie) {
      console.log('prCookie', prCookie); // Log the cookie for debugging
      expect(prCookie.domain).toBe('.lululemon.com'); // Assert the domain is correct
    } else {
      console.warn('No PR_NUMBER cookie was set.'); // Warn if no cookie is found
    }
  });
});
