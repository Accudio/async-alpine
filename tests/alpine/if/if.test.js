import { test, expect } from '@playwright/test'

test('alpine/x-if', async ({ page }) => {
  await page.goto('/tests/alpine/if/')
	await expect(page.getByTestId('test'))
		.toBeVisible()
});
