import { test, expect } from '@playwright/test'

test('misc/default-strategy', async ({ page }) => {
  await page.goto('/tests/misc/default-strategy/')

	await expect(page.getByTestId('test')).toBeEmpty()
	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
