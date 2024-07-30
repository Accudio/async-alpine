import { test, expect } from '@playwright/test'

test('strategies/visible', async ({ page }) => {
	const mouse = page.mouse

	await page.setViewportSize({
		width: 1000,
		height: 1000
	})
  await page.goto('/tests/strategies/visible/')

	const defaultEl = page.getByTestId('default')
	const customEl = page.getByTestId('custom')

	// check neither are loaded
	await expect(defaultEl).toHaveText('default rootMargin')
	await expect(customEl).toHaveText('custom rootMargin')

	// check 1000px down
	await mouse.wheel(0, 1000);
	await expect(defaultEl).toHaveText('default rootMargin')
	await expect(customEl).toHaveText('custom rootMargin')

	// check 1100px down
	await mouse.wheel(0, 100);
	await expect(defaultEl).toHaveText('default rootMargin: loaded')
	await expect(customEl).toHaveText('custom rootMargin')

	// check 1500px down
	await mouse.wheel(0, 400);
	await expect(customEl).toHaveText('custom rootMargin')

	// check 1800px down
	await mouse.wheel(0, 300);
	await expect(customEl).toHaveText('custom rootMargin: loaded')
});
