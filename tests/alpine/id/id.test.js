import { test, expect } from '@playwright/test'

test('alpine/x-id', async ({ page }) => {
  await page.goto('/tests/alpine/id/')
	await expect(page.getByTestId('1'))
		.toHaveText('id-1')
	await expect(page.getByTestId('2'))
		.toHaveText('id-2')
});
