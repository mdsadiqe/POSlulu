/*
This file is used for any action functions or methods that interact with the Home Page
 */
// pages/homePage.ts
import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import { HomePageLocator } from '../pages/homePageLocator';
import { Environment } from '../support/environment';
import { updateResultinExcel } from "../support/excelUtil";
import { TESTDATA } from '../globals';



export class HomePage {
  private page: Page;
  private context: BrowserContext;
  colorFound: boolean;
  productFound = false
  constructor(page: Page, context: BrowserContext)
  {
    this.page = page; 
    this.context= context;
    this.colorFound = false;
  }

  async login(username: string, password: string) {
    await this.page.locator(HomePageLocator.username).fill(username);
    await this.page.locator(HomePageLocator.password).fill(password);
    await this.page.locator(HomePageLocator.loginButton).click();
  }

  async navigateToUrl(local: string) {
    let url = Environment.getEnvironment(local);
    console.log(`Navigate to URL: ${url}`);
    await this.page.goto(url); 

    const homePagePopUp = this.page.locator(HomePageLocator.markdownHomePagePopUp);
    //await this.page.waitForLoadState('load'); // waits for full page load
    //await this.page.waitForLoadState('networkidle');  // ensures no pending requests
    //await homePagePopUp.waitFor(); // This is more targeted and often better than waiting for the whole page.
    //await homePagePopUp.isVisible();   // Return value: true or false.
    try {
    // Wait up to 5 seconds for popup to be visible
    await homePagePopUp.waitFor({ state: "visible", timeout: 50000 });
    // If visible, click close button
    await this.page.locator(HomePageLocator.modalCloseButton).click();
    } catch {
        console.log("Popup not visible. continuing...");
    }
  }

  async acceptCookies() {
    await this.page.locator(HomePageLocator.homePagePopUp).click();
  }

  async navigateToNewTab(productLocator: any) {
    // let newPage;
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page', { timeout: 5000 }),
      productLocator.click({ modifiers: ['Meta'] })
    ])

    return newPage;
   
  }



  async crawlToProduct(rowNumber: number, productName: string, Class: string, mdProductId: string):Promise<Page>{
    // const href = await this.page.locator(HomePageLocator.weMadeTooMuch).getAttribute('href'); //link top nav - we made too much
    const href = '/c/we-made-too-much/n18mhd'; //hardcoded link to avoid locator issue
    const link = "https://shop.lululemon.com" + href; // +href->/c/we-made-too-much/n18mhd

    //checking the opens tabs
    const allTabs = this.context.pages()
    //closing 3rd tab
    if(allTabs.length>2){
      console.log('-  - - - - Closing extra tab - - - - - -');
      allTabs[2].close()
    }
    

    let currentPageUrl = this.page.url()
    // console.log(' - - - - - - Crawl: PDP URL',currentPageUrl);

    if (!currentPageUrl.includes('we-made-too-much')) {
      console.log(`we are about to go to Category Page:`);
      
      if (href) {
        console.log('Navigating to:', link);//https://preview.lululemon.com/c/we-made-too-much/n18mhd"
        await this.page.goto(link);
      } else {
        throw new Error(`No href found for locator: ${HomePageLocator.weMadeTooMuch}`);
      }
      //await this.page.mouse.move(0, 0);
      try {
        await this.page.waitForSelector(HomePageLocator.womenChecbox); //wait checkbox filter women
      } catch (error) {
        console.log("Unable to find women checkbox...trying again.")
        await this.page.waitForSelector(HomePageLocator.menChecbox); // wait checkbox filter for men
      }

      //Need to incude -> to check checkbox clicked or not <- -
      // click an empty part of the page to remove hover state
      switch (true) {
        case Class.includes("Women"):
          console.log("Selecting Women category");
          await this.page.locator(HomePageLocator.womenChecbox).click(); // click on checkbox
          break;

        case Class.includes("Men"):
          console.log("Selecting Men category");
          await this.page.locator(HomePageLocator.menChecbox).click();
          break;
        default:
          console.log("Not selecting any category");
      }
      
    }

    let newPage = this.page;
    let found = false;
    let lastHeight = 0;
    let count = 0;
    // console.log('while status', found);

    while (!found) {
      // Check if product exists
      const productLocator =  this.page.locator(HomePageLocator.expProductDisplay(productName));
     
      if (await productLocator.count() > 0) {
        console.log(`Product "${productName}" found! Clicking...`);
        // await productLocator.first().click();
        // console.log(`ProductLocatorInWhile: ${productLocator}`);
        const newPage = await this.navigateToNewTab(productLocator)
        await newPage.waitForLoadState('domcontentloaded');
        console.log(`Current URL: ${newPage.url()}`);
        found = true;
        this.productFound = true
        return newPage;
        // break;
       }
      
      // console.log('Starting scroll to load more products...');
      // Scroll to bottom to trigger lazy loading
      
      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(2000); // Wait for lazy load
      const newHeight = await this.page.evaluate(() => document.body.scrollHeight);
      // Check if height changed → if not, check "View More Products" button
      // console.log('calculated heights:') 
      if (newHeight === lastHeight) {
        // const viewMore = this.page.locator('button:has-text("View More Products")');
        const viewMore = this.page.getByRole('link', { name: 'View More Products' })
        //page.locator('a:has-text("VIEW MORE PRODUCTS")')
        if (await viewMore.count() > 0) {
          console.log("Clicking 'View More Products' button...");
          await viewMore.first().click();
          await this.page.waitForTimeout(2000); // Wait for products to load
  
        } else {
            // console.log("Searching by PID:");
            found = await this.searchProductById(mdProductId, mdProductId, newPage);
            if (!found) {
              const message = "Product " + productName + " not found and no more products to load.";
              console.log(message);
              await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.productNoteColumn, message, false, false);
              break;
            }
          
        }
      }
      
      count++;
      lastHeight = newHeight;
      console.log('counting scrolls', count);
      
      if (count >3) { // safety to avoid infinite loop
      found = await this.searchProductById(mdProductId, productName, newPage);
      console.log('Search performed by PID', found);
      }
    }
    return newPage;
    
  }

  //Update the color value for product verification
  async colorUpdate(color: boolean) {
    this.colorFound = color;
  }

  //check the color availability
  async colorCheck() {
    // console.log("Color found status:", this.colorFound);
    return this.colorFound;
  }


  //Searching product by ID if not available on the category page
  


  async verifyProduct(rowNumber: number, expProductName: string, expColor: string,newTab:Page) {
      //Checking product status for validation
      if(!this.productFound){
        console.log(`Product is not available on WEB:`);
        return; 
      }

     //Temp pop-up
    console.log(`----productFound:----- ${this.productFound}`);
    const homePagePopUp = newTab.locator(HomePageLocator.markdownHomePagePopUp);
    try {
    // Wait up to 5 seconds for popup to be visible
    await homePagePopUp.waitFor({ state: "visible", timeout: 5000 });
    // If visible, click close button
    await newTab.locator(HomePageLocator.modalCloseButton).click();
    } catch {
        console.log("Popup not visible. continuing...");
    }

//- - --  - - - - - --
  // Verify Color
    try {
      const colorName = await newTab.locator(HomePageLocator.expColor(expColor)).getAttribute("title");
      console.log(`Actual color name: ${colorName}`);
      expect(colorName?.trim()).toBe(expColor);
      await newTab.locator(HomePageLocator.expColor(expColor)).click();
      let message = `Passed: ${expColor}" is present.`;
      await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.colorNotesColumn, message,false,false);
  //update color found status as true
      await this.colorUpdate(true);
    } catch (error) {
      const skippedProductValidation= 'Product validation is skipped as Color is not available -> ';
      const message = skippedProductValidation+`Expected Color "${expColor}" for "${expProductName}" was not present. `;
      console.error(message);
      await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.colorNotesColumn, message,false,false); //udpated the excel
      await this.colorUpdate(false); //update color found status as false
      return;
    }
    
    // Verify Product Name
    try {
      // Skipping,as color not found
      if (! await this.colorCheck()) {
        console.log(`Skipping production validation as color is not available`);
        return;
      }
      const productName = await newTab.locator(HomePageLocator.expProductName).textContent(); //product name on UI
      console.log("Actual product name:", productName);
      // const currentProductUrl = this.page.url();
      // console.log("Current product URL - ",currentProductUrl);
      expect(productName?.trim()).toBe(expProductName);
      let message = `Passed: ${expProductName}" is present.`;
      await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.productNoteColumn, message, true, false);
    } catch (error) {
      const message = `Expected Product name not matched with product name on UI"${expProductName}".`;
      console.error(message);
      await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.productNoteColumn, message, false, false);
      return;
    }
    // If both pass then mark PASS
    const message = `Product "${expProductName}" with color "${expColor}" verified successfully.`;
    console.log(message);
  }
  // 
  async verifyProductSize(rowNumber: number, expSize: string,newPage:Page) {
    if(!this.productFound)return; 
    // skipping validation if color not found
    if (!await this.colorCheck()) return;
      // turn it into an array.
    const expectedSizes = expSize.split(',').map(s => s.trim());
    console.log("Expected Sizes:", expectedSizes);

    // This returns an array of strings without looping manually.
    const sizeTexts = await newPage.locator(HomePageLocator.sizes).allTextContents();
    console.log("Sizes on Page: ", sizeTexts);

    const sizeMissing: string[] =[];
    // check size list length matches
    try {
      expect(sizeTexts.length).toBe(expectedSizes.length);
    } catch {
      const message = "Sizes on UI " + sizeTexts + " not matched with expected sizes " + expectedSizes + " for this product.";
      console.log(message);
      updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.sizeNotesColumn, message,false,false);
      // return;
    }
      /*
    //checking, if UI is having extra sizes
    sizeTexts.forEach(size => {
      try {
        expect(expectedSizes).toContain(size)
      }
      catch{
        sizeMissing.push(size)
        console.log(`Sdq SizeOf:-> ${size}`);
      }
    })

      // check each expected size exists
    expectedSizes.forEach(size => {
      try {
        expect(sizeTexts).toContain(size);
        // console.log(`sdq: ${size}`);
        
      } catch {
      
        sizeMissing.push(size)
        console.log(`Sdq Size-> ${size}`);
        
        const message = "Sizes " +  sizeMissing+ " not present for this product.";
        console.log(message);
        updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.sizeNotesColumn, message,false,false);
      }
    });
    console.log(`Total missing product sizes: ${sizeMissing}`);
    */

    if (sizeTexts.length==expectedSizes.length) {
       let message = `Passed: "${expectedSizes}" are present.`;
    updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.sizeNotesColumn, message,false,false);
    }
   
  }

  async verifyMarkdProductPrice(rowNumber: number, expRegPrice: string, expMarkPrice: string,newPage:Page){
    if(!this.productFound)return; 
    // skipping validation if color not found
    if(!await this.colorCheck())  return;    
    newPage.locator(HomePageLocator.activeSize).scrollIntoViewIfNeeded();
    //Getting regular price Range
    
    let markdownPrice1     = await newPage.locator(HomePageLocator.markdownPrice).textContent();
    let regularPrice1      = await newPage.locator(HomePageLocator.regularPrice).textContent();

    console.log(`RegularPrice: ${regularPrice1},Markdown:${markdownPrice1}`);
    

    await newPage.locator(HomePageLocator.activeSize).click();
    // This returns an array of strings without looping manually.
    let markdownPrice = null;
    let regularPrice  = null;
    markdownPrice     = await newPage.locator(HomePageLocator.markdownPrice).textContent();
    regularPrice      = await newPage.locator(HomePageLocator.regularPrice).textContent();



    markdownPrice     = markdownPrice?.trim().replace(/\s+/g, " ").split(" ")[0];
    regularPrice      = regularPrice?.trim().replace(/\s+/g, " ").split(" ")[0];  // the space there is a non-breaking space, not a regular space (" ").
    console.log(`Prices on Page: Markdown - ${markdownPrice} | Regular - ${regularPrice}`);

    // check size list length matches
    try{
      expect(markdownPrice).toBe(expMarkPrice);  // getting price from UI in $49 USD but only $49 needed.
      expect(regularPrice).toBe(expRegPrice);
      const message = `Passed: "MarkedDownPrice-${markdownPrice} & RegularPrice-${regularPrice}" are present.`;
      updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.priceNotesColumn, message, false, true);
    }catch {
      const message = "Markdown Price "+markdownPrice+" and Regular Price "+regularPrice+" on UI not matched with expected Markdown price "+expMarkPrice+" and Regular price "+expRegPrice+" for this product.";
      console.log(message);
      updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.priceNotesColumn, message,false,false);
      return;
    }
  }

  async verifyProductAccordions(rowNumber: number) {
    if(!this.productFound)return; 
  // skipping validation if color not found
      if(!await this.colorCheck())  return;
    // - use toHaveAttribute('aria-expanded') → checks functional state (accessibility, logic)
    // - use toHaveCSS('height', '0px') → checks visual state (UI actually collapsed/expanded)
    // WHY WE MADE THIS
    try{
      await expect(this.page.locator(HomePageLocator.whyWeMadeThisExpander)).toHaveCSS('height', '0px');
      await this.page.locator(HomePageLocator.whyWeMadeThis).click();
      await expect(this.page.locator(HomePageLocator.whyWeMadeThisSummary)).toHaveAttribute('aria-expanded', 'true');
      await expect(this.page.locator(HomePageLocator.whyWeMadeThisExpander)).not.toHaveCSS('height', '0px');

      // PRODUCT DETAIL
      await expect(this.page.locator(HomePageLocator.ProductDetailExpander).first()).toHaveCSS('height', '0px');
      await this.page.locator(HomePageLocator.ProductDetail).click();
      await expect(this.page.locator(HomePageLocator.ProductDetailSummary).first()).toHaveAttribute('aria-expanded', 'true');
      await expect(this.page.locator(HomePageLocator.ProductDetailExpander).first()).not.toHaveCSS('height', '0px');

      // ITEM REVIEW
      await expect(this.page.locator(HomePageLocator.itemReviewExpander)).toHaveCSS('height', '0px');
      await this.page.locator(HomePageLocator.itemReview).click();
      await expect(this.page.locator(HomePageLocator.itemReviewSummary)).toHaveAttribute('aria-expanded', 'true');
      await expect(this.page.locator(HomePageLocator.itemReviewExpander)).not.toHaveCSS('height', '0px');
    }catch (error){
        const message = "There is a issue with Accordions - "+error;
        console.log(message);
        // updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.commentColumn, message,false,false);
    }
  }
  
  async verifyProductImages(rowNumber: number,newPage:Page) {
    if(!this.productFound)return; 
  // skipping validation if color not found
    if(!await this.colorCheck())  return;
    const brokenImages: string[] = [];
    // Include all images, not just those with loading="lazy"
    // const images = await this.page.locator('img').all();
    const carouselmage = await newPage.locator(HomePageLocator.carouselImage).all();
    const thumbImage   = await newPage.getByRole('img',{name: 'Slide'}).all();

    const whyWeMadeThisImage = await newPage.locator(HomePageLocator.whyWeMadeThis).all()
    const images = [...carouselmage, ...thumbImage, ...whyWeMadeThisImage]
    console.log(`Total images found: ${images.length}`);

    for (const img of images) {
      const src    = (await img.getAttribute('src')) || (await img.getAttribute('data-src'));
      const srcset = (await img.getAttribute('srcset')) || (await img.getAttribute('data-srcset'));

      const urlsToCheck: string[] = [];

      // Check normal src
      if (src && !src.startsWith('data:')) {
        try {
          urlsToCheck.push(new URL(src, newPage.url()).toString());
        } catch {
          console.log(`Invalid src URL skipped: ${src}`);
        }
      }

      // Check srcset URLs
      if (srcset) {
        const srcsetUrls = srcset
          .split(',')
          .map(entry => entry.trim().split(' ')[0])
          .filter(url => url && !url.startsWith('data:'))
          .slice(0, 1); // only check the first srcset URL

        for (const url of srcsetUrls) {
          try {
            urlsToCheck.push(new URL(url, newPage.url()).toString());
          } catch {
            console.log(`Invalid srcset URL skipped: ${url}`);
          }
        }
      }

      // Validate all resolved URLs
      for (const url of urlsToCheck) {
        try {
          const response = await newPage.request.get(url);
          if (!response.ok()) {
            console.log(`Broken image: ${url} → Status: ${response.status()}`);
            brokenImages.push(url);
          }
        } catch (error) {
          console.log(`Error checking image: ${url} → ${error}`);
          brokenImages.push(url);
        }
      }
    }

    if (brokenImages.length > 0) {
      const message = brokenImages.join('\n'); // each on new line
      console.log(`Broken images found:\n${message}`);
      await updateResultinExcel(TESTDATA.Path, rowNumber, TESTDATA.imageNotesColumn, message,false,false);
    } else {
      console.log("No broken images");
    }

  }

async searchProductById(MarkdownPID: string, productName: string, newPage:Page) {
    console.log(`Searching product by ID: ${MarkdownPID}`);

    const allPages = this.context.pages();
    const activePage = allPages[2]
    
    // console.log("Open tabs:", allPages.map(p => p.url()));
    
    // const secondPage = allPages[2]
    let found = false;
    try {
      await activePage.bringToFront();
      const searchBox = activePage.getByTestId(HomePageLocator.globalSearchBox);
      await searchBox.fill(MarkdownPID) // Directly press Enter after filling
      await searchBox.press('Enter');
      const productTile = "//div[@class='product-tile']/a[@data-productid='" + MarkdownPID + "']";
      await activePage.waitForTimeout(3000); // Wait for search results to load
      const productTiles = activePage.locator(productTile);
      const totalProducts = await productTiles.count();
      console.log(`Total product tiles found: ${totalProducts}`);
      console.log(`xPath product: ${productTiles} and product name: ${productName}`);
 
      if (totalProducts > 0) {
        if (totalProducts > 1) {
          console.log(`Multiple products found with PID: ${MarkdownPID}, clicking the first one.`);
        }
        // await productLocator.first().click();
        await productTiles.first().click();
        console.log(`product found by ID: ${productName}..clicking`);
        found = true;
      }
      else {
        console.log(`Product with ID: ${MarkdownPID} not found via search.`);
        found = true;
        this.productFound = false
      }
    }
    catch {
      console.log(`Product not found By ID:`);
      found = true;
    }
    return found;
  }
}

  
