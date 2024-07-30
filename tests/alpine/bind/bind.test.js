import { test, expect } from '@playwright/test'

test('alpine/x-bind', async ({ page }) => {
  await page.goto('/tests/alpine/bind/')
	await expect(page.getByTestId('longhand'))
		.toHaveCSS('background-color', 'rgb(255, 255, 0)')
	await expect(page.getByTestId('shorthand'))
		.toHaveCSS('background-color', 'rgb(0, 255, 255)')
});
