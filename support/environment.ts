/**
 * Environment configuration utility
 *
 * This file defines environment-specific variables such as base URLs, credentials,
 * and flags for test execution.
 */
import appTestDataRaw from '../testData/appTestData.json' assert { type: 'json' };
const appTestData = JSON.parse(JSON.stringify(appTestDataRaw));
import { ENV } from './env';
import { Utilities } from './utilities';


export class Environment {
  static getEnvironment(locale: string): string {
    const decoded = Utilities.decodeBase64(ENV.LOWER_AUTH);
    switch (locale) {
      case 'DE':
        return appTestData.dedevurl.replace('basicaut', decoded);
      case 'AU':
        return appTestData.audevurl.replace('basicaut', decoded);
      case 'FR':
        return appTestData.frdevurl.replace('basicaut', decoded);
      default:
        return appTestData.audevurl.replace('basicaut', decoded);
    }
  }

  static getEnv(key: string, defaultValue: string = ''): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      console.warn(
        `WARNING: Environment variable "${key}" is not set. Using default: "${defaultValue}".`
      );
      return defaultValue;
    }
    return value;
  }
}
