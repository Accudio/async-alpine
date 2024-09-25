import { test, expect } from '@playwright/test'

test('alpine/x-show', async ({ page }) => {
  await page.goto('/tests/alpine/show/')
	await expect(page.getByTestId('test'))
		.toBeVisible()
});
