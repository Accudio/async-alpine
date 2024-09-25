import { test, expect } from '@playwright/test'

test('strategies/basic-and', async ({ page }) => {
  await page.goto('/tests/strategies/basic-and/')
	await expect(page.getByTestId('test'))
		.toBeEmpty()

	await page.getByTestId('button').click()
	await expect(page.getByTestId('test'))
		.toBeEmpty()

	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
