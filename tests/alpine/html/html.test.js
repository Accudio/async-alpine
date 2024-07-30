import { test, expect } from '@playwright/test'

test('alpine/x-html', async ({ page }) => {
  await page.goto('/tests/alpine/html/')
	await expect(page.getByTestId('test'))
		.toHaveText('testing123')
	await expect(page.getByTestId('strong'))
		.toHaveText('testing')
});
