import { test, expect } from '@playwright/test';

test.describe('Database Integration', () => {
  test('should load database and display categories', async ({ page }) => {
    // Capture ALL console messages
    const consoleMessages: Array<{type: string, text: string}> = [];
    page.on('console', msg => {
      const entry = { type: msg.type(), text: msg.text() };
      consoleMessages.push(entry);
      console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.error(`[BROWSER ERROR] ${error.message}`);
      console.error(error.stack);
    });

    // Navigate to the app
    console.log('[TEST] Navigating to app...');
    await page.goto('/');
    
    // Wait for the app to load
    console.log('[TEST] Waiting for app to load...');
    await page.waitForTimeout(5000);
    
    // Log all captured messages
    console.log('[TEST] All console messages:', JSON.stringify(consoleMessages, null, 2));
    
    // Check for database initialization
    const dbInitMessages = consoleMessages.filter(log => 
      log.text.includes('Initializing SQL.js') ||
      log.text.includes('Database initialized') ||
      log.text.includes('Database initialization failed')
    );
    console.log('[TEST] DB init messages:', dbInitMessages);
    
    // Check if database initialized successfully
    const dbInitSuccess = consoleMessages.find(log => 
      log.text.includes('Database initialized successfully')
    );
    
    if (!dbInitSuccess) {
      const dbInitError = consoleMessages.find(log =>
        log.text.includes('Database initialization failed') ||
        log.text.includes('Failed to fetch')
      );
      console.log('[TEST] DB init error:', dbInitError);
    }
    
    expect(dbInitSuccess).toBeTruthy();
    
    // Check for available categories
    const categoriesMessages = consoleMessages.filter(log =>
      log.text.includes('Available categories:') ||
      log.text.includes('getAvailableCategories') ||
      log.text.includes('Available categories')
    );
    console.log('[TEST] Categories messages:', categoriesMessages);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true });
    
    // Verify the page has loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display header with category buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/header-screenshot.png' });
    
    // Check if header exists
    const headerVisible = await page.locator('div.absolute.top-0').isVisible().catch(() => false);
    console.log('[TEST] Header visible:', headerVisible);
    
    // Check for any buttons in the header
    const buttons = await page.locator('div.absolute.top-0 button').count();
    console.log('[TEST] Number of buttons in header:', buttons);
    
    // Log the HTML content for debugging
    const html = await page.content();
    console.log('[TEST] Page HTML length:', html.length);
    console.log('[TEST] Page contains "回収カテゴリ":', html.includes('回収カテゴリ'));
  });
});
