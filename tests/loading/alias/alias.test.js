import { test, expect } from '@playwright/test'

test('loading/alias', async ({ page }) => {
  await page.goto('/tests/loading/alias/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
