/*
This file is used for any action functions or methods that interact with the Home Page
 */
// pages/homePage.ts
import { Page, expect } from '@playwright/test';
import { HomePageLocator } from '../pages/homePageLocator';
import { Environment } from '../support/environment';

export class HomePage {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async login(username: string, password: string) {
    await this.page.locator(HomePageLocator.username).fill(username);
    await this.page.locator(HomePageLocator.password).fill(password);
    await this.page.locator(HomePageLocator.loginButton).click();
  }

  async navigateToUrl() {
    let url = Environment.getEnvironment("AU");
    console.log(`Navigate to URL: ${url}`);
    await this.page.goto(url);
    const homePagePopUp = this.page.locator(HomePageLocator.homePagePopUp);
    //await this.page.waitForLoadState('load'); // waits for full page load
    //await this.page.waitForLoadState('networkidle');  // ensures no pending requests
    //await homePagePopUp.waitFor(); // This is more targeted and often better than waiting for the whole page.
    await homePagePopUp.isVisible();
    await expect(homePagePopUp).toHaveText('Choose a location');
    this.acceptCookies();
  }

  async acceptCookies() {
    await this.page.locator(HomePageLocator.homePagePopUp).click();
  }

}

  
