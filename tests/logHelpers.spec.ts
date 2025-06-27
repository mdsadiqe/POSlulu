/**
 * Example Spec File for Engineers
 *
 * This file serves as an example for testing logHelpers functionality.
 * Engineers can use this file as a reference or template for creating new tests.
 * It demonstrates key testing patterns, including Playwright utilities, and assertions.
 */

import { test, expect } from '@playwright/test';
import * as helpers from '../support/helpers';

test.describe('Log Helpers Tests', () => {
  /**
   * Test: Dynamically logs all exported helper functions.
   *
   * This test retrieves all functions from the `helpers` module and logs them dynamically.
   * It ensures that there are helper functions available for use in the project.
   */
  test('Dynamically logs all helper functions from helpers.ts file', async () => {
    // Filter keys in the helpers object to include only functions
    const helperFunctions = Object.keys(helpers).filter(
      (key) => typeof (helpers as Record<string, unknown>)[key] === 'function'
    );

    // Log all available helper functions
    console.log('Available Helper Functions:');
    helperFunctions.forEach((helper) => console.log(`- ${helper}`));

    // Assert that at least one helper function is available
    expect(helperFunctions.length).toBeGreaterThan(0);
  });
});
