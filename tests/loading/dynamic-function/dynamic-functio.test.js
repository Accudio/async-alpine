import { test, expect } from '@playwright/test'

test('loading/dynamic-function', async ({ page }) => {
  await page.goto('/tests/loading/dynamic-function/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
