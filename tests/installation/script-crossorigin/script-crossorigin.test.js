import { test, expect } from '@playwright/test'

test('installation/script-crossorigin', async ({ page }) => {
  await page.goto('/tests/installation/script-crossorigin/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
