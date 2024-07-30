import { test, expect } from '@playwright/test'

test('strategies/basic-or', async ({ page }) => {
  await page.goto('/tests/strategies/basic-or/')
	await expect(page.getByTestId('test'))
		.toBeEmpty()

	await page.getByTestId('button').click()
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')

	// reload the page for a fresh test
	await page.reload()
	await expect(page.getByTestId('test'))
	.toBeEmpty()

	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
