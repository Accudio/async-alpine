import { test, expect } from '@playwright/test'

test('strategies/idle', async ({ page }) => {
  await page.goto('/tests/strategies/idle/')

	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
