import { test, expect } from '@playwright/test'

test('mutations/mutation', async ({ page }) => {
  await page.goto('/tests/mutations/mutation/')
	await page.getByTestId('button').click()
	await expect(page.getByTestId('result'))
		.toHaveText('Output loaded')
});
