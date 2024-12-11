import { test, expect } from '@playwright/test'

test('alpine/morph', async ({ page }) => {
  await page.goto('/tests/alpine/morph/')
	await expect(page.getByTestId('test'))
		.toHaveText('testing123')
	await page.getByTestId('button').click()
  await expect(page.getByTestId('test'))
  	.not.toHaveAttribute('x-ignore')
	await expect(page.getByTestId('test'))
		.toHaveText('testing123')
});
