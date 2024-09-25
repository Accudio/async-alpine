import { test, expect } from '@playwright/test'

test('strategies/event', async ({ page }) => {
  await page.goto('/tests/strategies/event/')

	await page.getByTestId('standard-button').click()
	await expect(page.getByTestId('standard-result'))
		.toHaveText('loaded')

	await page.getByTestId('custom-button').click()
	await expect(page.getByTestId('custom-result'))
		.toHaveText('loaded')
});
