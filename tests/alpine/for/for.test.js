import { test, expect } from '@playwright/test'

test('alpine/x-for', async ({ page }) => {
  await page.goto('/tests/alpine/for/')
	const el = page.getByTestId('test')
	await expect(el).toHaveText('0123456789')
});
