import { test, expect } from '@playwright/test'

test('alpine/x-on', async ({ page }) => {
  await page.goto('/tests/alpine/on/')

	await expect(page.getByTestId('shorthand-result'))
		.toBeHidden()
	await expect(page.getByTestId('longhand-result'))
		.toBeHidden()

	await page.getByTestId('longhand-button').click()
	await expect(page.getByTestId('longhand-result'))
		.toBeVisible()

	await page.getByTestId('shorthand-button').click()
	await expect(page.getByTestId('shorthand-result'))
		.toBeVisible()
});
