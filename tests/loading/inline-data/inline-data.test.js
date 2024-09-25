import { test, expect } from '@playwright/test'

test('loading/inline-data', async ({ page }) => {
  await page.goto('/tests/loading/inline-data/')
	await expect(page.getByTestId('1'))
		.toHaveText('loaded')
	await expect(page.getByTestId('2'))
		.toHaveText('loaded')
	await expect(page.getByTestId('3'))
		.toHaveText('loaded')
});
