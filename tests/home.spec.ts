import { test } from '@playwright/test';
import { POManager } from '../actions/POManager';

import testDataRaw from '../testData/testDataAU.json' assert { type: 'json' };
const testData = JSON.parse(JSON.stringify(testDataRaw));

// test.describe to declare a group of tests 
test.describe('Home Page Tests', () => {
  let poManager: POManager;

  // runs before all tests in the file. 
  test.beforeAll('Setup', async () => {
    console.log('Before tests');
  });

  // runs before each test in the file. 
  test.beforeEach(async ({ page }) => {
    console.log(`Running ${test.info().title}`);
    poManager = new POManager(page);
  });

  test('HomePage test 1',{tag: '@smoke', annotation:{type:'testcase', description:'Verifying navigate to home page.'}}, async () => {
    console.log("Test 1");
    console.log(`Reading JSON file - ${testData.skuID}`)
    console.log(`Reading productName - ${testData.productName}`)
    console.log(`Reading url - ${testData.url}`)
    const homePage = poManager.getHomePage();
    await homePage.navigateToUrl();
  });

  test('HomePage test 2',{tag: '@regression'}, async () => {
    console.log("Test 2");
    console.log(`Reading JSON file - ${testData.skuID}`);
    console.log(`Reading productName - ${testData.productName}`);
    console.log(`Reading url - ${testData.url}`);
  });

  // runs after each test in the file.
  test.afterEach(async () => {
    console.log(`Finished ${test.info().title} with status ${test.info().status}`);
    if (test.info().status !== test.info().expectedStatus)
      console.log(`Did not run as expected.`);
  });

  // runs after all tests in the file.
  test.afterAll('Teardown', async () => {
    console.log('Done with tests');
    // ...
  });
});

// Declares a group of tests that could be run in parallel. 
// test.describe.parallel('group', () => {
//   test('runs in parallel 1 @sanity', async ({ page }) => {});
//   test('runs in parallel 2 @sanity', async ({ page }) => {});
// });