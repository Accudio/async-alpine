import { test, expect } from '@playwright/test'

test('mutations/morph', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))

  await page.goto('/tests/mutations/morph/')

	await page.getByTestId('morph-button').click()
	await page.getByTestId('load-button').click()
	await expect(page.getByTestId('result'))
		.toHaveText('loaded')

	expect(errors).toEqual([])
});
