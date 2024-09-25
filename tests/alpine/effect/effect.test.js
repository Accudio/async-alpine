import { test, expect } from '@playwright/test'

test('alpine/x-effect', async ({ page }) => {
  await page.goto('/tests/alpine/effect/')
	const button = page.getByTestId('button')
	const result = page.getByTestId('result')
	await expect(result).toHaveText('false')
	await button.click()
	await expect(result).toHaveText('true')
	await button.click()
	await expect(result).toHaveText('false')
});
