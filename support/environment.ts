/**
 * Environment configuration utility
 *
 * This file defines environment-specific variables such as base URLs, credentials,
 * and flags for test execution.
 */


export class Environment {
  static getEnvironment(locale: string): string {
    switch (locale) {
      case 'standard':
        return "https://shop.lululemon.com";
        
      case 'markdown':
        return "https://shop.lululemon.com/p/men-ss-tops/Heavyweight-Cotton-Jersey-T-Shirt-MD/_/prod11700266?color=69122";
      case 'newness':
        return "https://shop.lululemon.com/p/mens-button-down-shirts/Brushed-Woven-Overshirt/_/prod11800777?color=69257";
      default:
        return "https://shop.lululemon.com";
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
