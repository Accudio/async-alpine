import { test, expect } from '@playwright/test'

test('alpine/x-cloak', async ({ page }) => {
  await page.goto('/tests/alpine/cloak/')
	const el = page.getByTestId('test')
	await expect(el).toBeHidden();
	await expect(el).toBeVisible();
});
