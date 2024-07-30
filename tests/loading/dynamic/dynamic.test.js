import { test, expect } from '@playwright/test'

test('loading/dynamic', async ({ page }) => {
  await page.goto('/tests/loading/dynamic/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
