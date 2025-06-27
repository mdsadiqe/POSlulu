/*
This file will be used for selectors on the Home Page
 */

import { Page, Locator } from '@playwright/test';

// Without export, the class is private to the file. 
// If you want to use this class in another file (like a test), you must export it.
// pages/homePageLocator.ts

export class HomePageLocator {
  // readonly is used because locators shouldn’t be reassigned after creation.
  static readonly username = '#username';
  static readonly password = '#password';
  static readonly loginButton = 'button[type="submit"]';
  static readonly homePagePopUp = '[aria-label="Choose a location"]';
}
