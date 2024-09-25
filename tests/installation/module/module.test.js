import { test, expect } from '@playwright/test'

test('installation/module', async ({ page }) => {
  await page.goto('/tests/installation/module/')
	await expect(page.getByTestId('test'))
		.toHaveText('loaded')
});
