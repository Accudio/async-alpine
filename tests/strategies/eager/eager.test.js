import { test, expect } from '@playwright/test'

test('strategies/eager', async ({ page }) => {
  await page.goto('/tests/strategies/eager/')

	await expect(page.getByTestId('implicit'))
		.toHaveText('implicit loaded')

	await expect(page.getByTestId('explicit'))
	.toHaveText('explicit loaded')
});
