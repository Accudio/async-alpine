import { test, expect } from '@playwright/test'

test('alpine/x-ignore', async ({ page }) => {
  await page.goto('/tests/alpine/ignore/')
	await expect(page.getByTestId('hidden'))
		.toBeHidden()
	await expect(page.getByTestId('shown'))
		.toBeHidden()
});
