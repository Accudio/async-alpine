import { test, expect } from '@playwright/test'

test('mutations/nested', async ({ page }) => {
  await page.goto('/tests/mutations/nested/')
	await page.getByTestId('button').click()
	await expect(page.getByTestId('result'))
		.toHaveText('Output loaded')
});
