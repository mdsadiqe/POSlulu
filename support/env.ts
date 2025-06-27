/**
 * env.ts
 *
 * This file centralizes the management of environment variables used in the project.
 * It includes helper functions for retrieving and validating variables, as well as
 * default values for optional variables.
 *
 * Engineers can reference this file to:
 * 1. Ensure critical environment variables are properly loaded.
 * 2. Define default values for variables to ensure application stability.
 * 3. Handle errors when required variables are missing.
 *
 * This file plays a crucial role in maintaining consistency across environments
 * (e.g., local development, staging, CI/CD pipelines).
 */

import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

/**
 * Utility function to safely retrieve environment variables.
 * If the variable is missing, it logs a warning but does not throw an error.
 * @param key The environment variable key
 * @param defaultValue The fallback value if the variable is not defined
 * @returns The environment variable value or the default value
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    console.warn(`WARNING: Environment variable "${key}" is not set. Using default: "${defaultValue}".`);
    return defaultValue;
  }
  return value;
};

// -------------------- TESTRAIL CONFIGURATION --------------------

/**
 * TestRail Project ID and Name
 * These values should be set in the GitLab pipeline variables or a `.env` file.
 * If they are not set, the TestRail uploader will be disabled, and a warning will be logged.
 */
export const TR_PROJECT_ID = getEnv('TR_PROJECT_ID');
export const TR_PROJECT_NAME = getEnv('TR_PROJECT_NAME');

if (!TR_PROJECT_ID || !TR_PROJECT_NAME) {
  console.warn('WARNING: TR_PROJECT_ID or TR_PROJECT_NAME is not set. TestRail results will not be uploaded.');
}

// -------------------- ENVIRONMENT CONFIGURATION --------------------

/**
 * Centralized configuration for environment variables.
 * Provides defaults for critical variables and validates required ones.
 */
export const ENV = {
  /**
   * The base URL of the application.
   * Defaults to "https://stage.lululemon.com".
   */
  BASE_URL: getEnv('BASE_URL', 'https://stage.lululemon.com'),

  /**
   * Determines if analytics calls should be blocked.
   * Defaults to `false`.
   */
  BLOCK_ANALYTICS_CALLS: getEnv('BLOCK_ANALYTICS_CALLS', 'false') === 'true',

  /**
   * Predefined hosts to block when BLOCK_ANALYTICS_CALLS is true.
   */
  BLOCKED_HOSTS: [
    '*.pinterest.*',
    '*.googletagmanager.*',
    '*.google-analytics.*',
    '*.googleapis.*',
    '*.adobedtm.*',
    '*.demdex.*',
    '*.quantummetric.*',
    '*.btttag.*',
    '*.tt.omtrdc.*',
    '*.celtra.*',
    '*.roeyecdn.*',
    '*.browser-intake-datadoghq.*',
  ],

  /**
   * Determines whether the viewport is set for desktop mode.
   * Defaults to `false` (mobile).
   */
  IS_DESKTOP: getEnv('IS_DESKTOP', 'false') === 'true',

  /**
   * Optional network URL for request interception.
   * Defaults to an empty string.
   */
  NETWORK_URL: getEnv('NETWORK_URL', ''),

  /**
   * Pull Request number for tracking or testing.
   * Defaults to an empty string.
   */
  PR_NUMBER: getEnv('PR_NUMBER', ''),

  /**
   * Sauce Labs access key.
   * Defaults to an empty string.
   */
  SAUCE_ACCESS_KEY: getEnv('SAUCE_ACCESS_KEY', '2f7e4e78-de8e-4880-8c9a-93c9ee739d8d'),

  /**
   * Sauce Labs username.
   * Defaults to an empty string.
   */
  SAUCE_USERNAME: getEnv('SAUCE_USERNAME', 'agupta9'),

  LOWER_AUTH: getEnv('LOWER_ENV_AUTH', 'defaultBasicAuth'),
};
