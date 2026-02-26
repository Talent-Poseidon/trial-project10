import { test, expect } from '@playwright/test';

test.describe('Admin can manage projects', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    // Login redirects to /dashboard, then navigate to admin projects
    await page.waitForURL('/dashboard');
    await page.goto('/admin/projects');
    await expect(page.getByTestId('project-page-nav')).toBeVisible();
  });

  test('Admin views the project list', async ({ page }) => {
    await page.goto('/admin/projects');
    await expect(page.getByTestId('project-list-container')).toBeVisible();
    // Check if the project list is populated
    const projectList = await page.$$('ul > li');
    expect(projectList.length).toBeGreaterThan(0);
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
