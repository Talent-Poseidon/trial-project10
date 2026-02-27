import { test, expect } from '@playwright/test';

test.describe('Admin can manage projects', () => {
  test.beforeEach(async ({ page }) => {
    const title = test.info().title;

    // 1. Check cookies in browser context
    console.log(`[Test: ${title}] Checking session cookies before navigation...`);
    const cookies = await page.context().cookies();
    const sessionToken = cookies.find(c => c.name.includes('session-token'));
    if (sessionToken) {
      console.log(`[Test: ${title}] Session Cookie Found: ${sessionToken.name} | Domain: ${sessionToken.domain} | Secure: ${sessionToken.secure} | SameSite: ${sessionToken.sameSite}`);
      console.log(`[Test: ${title}] Token value (first 50 chars): ${sessionToken.value.substring(0, 50)}...`);
    } else {
      console.error(`[Test: ${title}] CRITICAL: No session cookie found in context!`);
      console.log(`[Test: ${title}] All cookies:`, JSON.stringify(cookies.map(c => ({ name: c.name, domain: c.domain, secure: c.secure })), null, 2));
    }

    // 2. Navigate to admin projects
    console.log(`[Test: ${title}] Navigating to /admin/projects...`);
    const response = await page.goto('/admin/projects');
    console.log(`[Test: ${title}] Response status: ${response?.status()} | URL after navigation: ${page.url()}`);

    // 3. Check for redirect chain
    if (page.url().includes('/auth/login')) {
      console.error(`[Test: ${title}] CRITICAL: Redirected to login page!`);

      // Check if cookies are still present after redirect
      const postRedirectCookies = await page.context().cookies();
      const postRedirectSession = postRedirectCookies.find(c => c.name.includes('session-token'));
      console.error(`[Test: ${title}] Cookie after redirect: ${postRedirectSession ? 'PRESENT' : 'MISSING'}`);

      // Check server logs by making a direct API call
      try {
        const sessionCheck = await page.evaluate(async () => {
          const res = await fetch('/api/auth/session');
          return { status: res.status, body: await res.text() };
        });
        console.error(`[Test: ${title}] /api/auth/session response: status=${sessionCheck.status} body=${sessionCheck.body.substring(0, 200)}`);
      } catch (e) {
        console.error(`[Test: ${title}] Failed to check session API: ${e}`);
      }
    }

    // 4. Verify we are on the correct page
    await expect(page).toHaveURL(/\/admin\/projects/);
    await expect(page.getByTestId('project-page-nav')).toBeVisible();
  });

  test('Admin views the project list', async ({ page }) => {
    await page.goto('/admin/projects');
    await expect(page.getByTestId('project-list-container')).toBeVisible();

    // Wait for the project list to be populated (API fetch may take time)
    // Use Playwright's auto-waiting locator instead of page.$$ which is a snapshot
    const firstProject = page.locator('ul > li').first();
    await expect(firstProject).toBeVisible({ timeout: 10000 });

    const projectCount = await page.locator('ul > li').count();
    console.log(`[Project List] Found ${projectCount} projects`);
    expect(projectCount).toBeGreaterThan(0);
  });

  test('Admin sets up a new project', async ({ page }) => {
    await page.goto('/admin/projects');
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-name-input"]', 'New Project Alpha');
    await page.fill('[data-testid="start-date-input"]', '2023-11-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-31');
    await page.click('[data-testid="submit-project-btn"]');
    await expect(page.getByTestId('project-created-alert')).toContainText('Project created successfully');
  });

  test('Admin enters invalid project dates', async ({ page }) => {
    await page.goto('/admin/projects');
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-name-input"]', 'New Project Beta');
    await page.fill('[data-testid="start-date-input"]', '2024-01-31');
    await page.fill('[data-testid="end-date-input"]', '2023-11-01');
    await page.click('[data-testid="submit-project-btn"]');
    await expect(page.getByTestId('date-error-alert')).toContainText('End date must be after start date');
  });
});
