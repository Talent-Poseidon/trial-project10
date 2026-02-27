import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Define the path relative to project root
const authDir = path.join(__dirname, '../../playwright/.auth');
const authFile = path.join(authDir, 'admin.json');

setup('authenticate as admin', async ({ page }) => {
  console.log('--- GLOBAL AUTH SETUP STARTED ---');
  
  // Ensure the auth directory exists
  if (!fs.existsSync(authDir)){
      console.log(`Directory ${authDir} does not exist. Creating it...`);
      fs.mkdirSync(authDir, { recursive: true });
  }

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
  console.log('Verifying dashboard access...');
  await expect(page).toHaveURL(/\/dashboard/);
  
  // Add a small delay to ensure cookies are set
  await page.waitForTimeout(2000);
  
  // DEBUG: Check cookies
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name.includes('session-token'));
  
  if (sessionCookie) {
    console.log(`COOKIE FOUND: ${sessionCookie.name} | Domain: ${sessionCookie.domain} | Path: ${sessionCookie.path}`);
  } else {
    console.error('CRITICAL ERROR: No session token found in cookies after login!');
    console.log('All cookies:', cookies.map(c => c.name).join(', '));
  }
  
  // 6. Save storage state
  console.log(`Saving storage state to ${authFile}...`);
  await page.context().storageState({ path: authFile });
  
  // Verify file was created
  if (fs.existsSync(authFile)) {
    console.log('SUCCESS: Auth file created successfully.');
  } else {
    console.error('ERROR: Auth file was NOT created even after storageState call.');
    throw new Error('Failed to create auth file');
  }

  console.log('--- GLOBAL AUTH SETUP COMPLETED ---');
});