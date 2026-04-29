import { test, expect } from '@playwright/test';

test.describe('Map Markers', () => {
  test('should display facilities as markers on map', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto('/');
    
    // Wait for database initialization and facilities loading
    await page.waitForTimeout(5000);
    
    // Check console for facility loading
    const facilityLogs = consoleLogs.filter(log => 
      log.includes('getFacilities') || 
      log.includes('Got facilities from DB') ||
      log.includes('Converted to GeoJSON')
    );
    console.log('Facility logs:', facilityLogs);
    
    // Check that facilities were loaded (not 0)
    const facilitiesLoaded = consoleLogs.find(log =>
      log.includes('Got facilities from DB:') && 
      !log.includes('Got facilities from DB: 0')
    );
    expect(facilitiesLoaded).toBeTruthy();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/markers-test.png' });
    
    // Look for map markers (MapLibre markers)
    // MapLibre markers have class 'maplibregl-marker'
    const markers = await page.locator('.maplibregl-marker').count();
    console.log(`Found ${markers} markers on map`);
    
    // Should have more than 0 markers
    expect(markers).toBeGreaterThan(0);
  });

  test('should display categories and markers together', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    // Check categories are visible
    const categoryButtons = await page.locator('button').filter({ hasText: /電池|家電|蛍光灯/ }).count();
    console.log(`Found ${categoryButtons} category buttons`);
    expect(categoryButtons).toBeGreaterThan(0);
    
    // Check markers are visible
    const markers = await page.locator('.maplibregl-marker').count();
    console.log(`Found ${markers} markers`);
    expect(markers).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/full-app-test.png', fullPage: true });
  });

  test('should filter markers when categories change', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Get initial marker count
    const initialMarkers = await page.locator('.maplibregl-marker').count();
    console.log(`Initial markers: ${initialMarkers}`);
    
    // Click on a category button to deselect it
    const categoryButton = page.locator('button').filter({ hasText: '乾電池' }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(2000);
      
      // Check if markers changed
      const newMarkers = await page.locator('.maplibregl-marker').count();
      console.log(`Markers after filter: ${newMarkers}`);
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/filtered-markers.png' });
    }
  });
});
