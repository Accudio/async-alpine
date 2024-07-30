import { test, expect } from '@playwright/test'

test('loading/alias-function', async ({ page }) => {
  await page.goto('/tests/loading/alias-function/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
