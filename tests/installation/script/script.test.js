import { test, expect } from '@playwright/test'

test('installation/script', async ({ page }) => {
  await page.goto('/tests/installation/script/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
