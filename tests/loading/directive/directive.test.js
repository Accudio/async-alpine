import { test, expect } from '@playwright/test'

test('loading/directive', async ({ page }) => {
  await page.goto('/tests/loading/directive/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
