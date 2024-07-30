import { test, expect } from '@playwright/test'

test('alpine/x-text', async ({ page }) => {
  await page.goto('/tests/alpine/text/')
	await expect(page.getByTestId('test'))
		.toHaveText('testing123')
});
