import { test, expect } from '@playwright/test'

test('loading/inline', async ({ page }) => {
  await page.goto('/tests/loading/inline/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
