const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER LOG] ${msg.type()}: ${msg.text()}`);
  });

  await page.goto('http://localhost:3000/discover', { waitUntil: 'networkidle' });
  
  console.log('Clicking crave button...');
  await page.click('button[data-testid="btn-crave"]');
  
  await page.waitForTimeout(1000);
  
  console.log('Fetching top dish text...');
  const text = await page.locator('[data-testid="dish-card"] h2').first().textContent();
  console.log('Current Dish:', text);
  
  await browser.close();
})();
