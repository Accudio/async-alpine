import { test, expect } from '@playwright/test'

test('alpine/x-teleport', async ({ page }) => {
  await page.goto('/tests/alpine/teleport/')
	await expect(page.getByTestId('test'))
		.toHaveText('content\n\nToggled content')
});
