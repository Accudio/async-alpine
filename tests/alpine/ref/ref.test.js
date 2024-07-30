import { test, expect } from '@playwright/test'

test('alpine/x-ref', async ({ page }) => {
  await page.goto('/tests/alpine/ref/')

	await expect(page.getByTestId('string'))
		.toHaveText(await page.getByTestId('src').innerHTML())
});
