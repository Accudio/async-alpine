import { test, expect } from '@playwright/test'

test('loading/url', async ({ page }) => {
  await page.goto('/tests/loading/url/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
