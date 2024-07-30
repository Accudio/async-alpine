import { test, expect } from '@playwright/test'

test('installation/module-crossorigin', async ({ page }) => {
  await page.goto('/tests/installation/module-crossorigin/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
