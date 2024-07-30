import { test, expect } from '@playwright/test'

test('mutations/body', async ({ page }) => {
  await page.goto('/tests/mutations/body/')
	await page.getByTestId('button').click()
	await expect(page.locator('body'))
		.toHaveText('Output loaded')
});
