import { Page } from '@playwright/test';
import { HomePage } from './homePageActions';

export class POManager {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getHomePage(): HomePage {
    return new HomePage(this.page);;
  }
}
