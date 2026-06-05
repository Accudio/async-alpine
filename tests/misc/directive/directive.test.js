import { test, expect } from '@playwright/test'

test('loading/directive', async ({ page }) => {
  await page.goto('/tests/misc/directive/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
