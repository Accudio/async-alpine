import { test, expect } from '@playwright/test'

test('alpine/x-modelable', async ({ page }) => {
  await page.goto('/tests/alpine/modelable/')
	const input = page.getByTestId('input')
	const output = page.getByTestId('output')
	await input.fill('testing123')
	await expect(output).toHaveText('testing123')
	await input.fill('456test!')
	await expect(output).toHaveText('456test!')
});
