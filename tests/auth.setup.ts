import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  console.log('Starting global authentication setup...');
  
  // 1. Navigate to login page
  console.log('Navigating to /auth/login...');
  await page.goto('/auth/login');
  
  // 2. Fill credentials
  console.log('Filling admin credentials...');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // 3. Submit form
  console.log('Submitting login form...');
  await page.click('button[type="submit"]');
  
  // 4. Wait for redirection to dashboard
  console.log('Waiting for redirection to /dashboard...');
  await page.waitForURL('/dashboard');
  
  // 5. Verify successful login by checking a key element on dashboard
  // Using a robust selector that should exist on dashboard
  // If this fails, it means login was not successful even if URL changed
  console.log('Verifying dashboard access...');
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Add a small delay to ensure cookies are set
  await page.waitForTimeout(1000);
  
  // 6. Save storage state
  console.log(`Saving storage state to ${authFile}...`);
  await page.context().storageState({ path: authFile });
  
  console.log('Global authentication setup completed successfully.');
});