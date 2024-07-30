import { test, expect } from '@playwright/test'

test('strategies/complex-combination', async ({ page }) => {
  await page.goto('/tests/strategies/complex-combination/')
	const el = page.getByTestId('test')
	const btn = page.getByTestId('button')

	// check if > 1200px, should be ❌
	await expect(el).toBeEmpty()
	await page.reload()

	// check if < 820px, should be ❌
	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await expect(el).toBeEmpty()
	await page.reload()

	// check if 820px < screen < 1200px, should be ❌
	await page.setViewportSize({
		width: 1024,
		height: 768
	})
	await expect(el).toBeEmpty()
	await page.reload()

	// check if 820px < screen < 1200px AND button has been pressed, should be ❌
	await btn.click()
	await expect(el).toBeEmpty()
	await page.reload()

	// check if < 820px AND button has been pressed, should be ✅
	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await btn.click()
	await expect(el).toHaveText('loaded')
	await page.reload()

	// check if > 1200px AND button has been pressed, should be ✅
	await page.setViewportSize({
		width: 1280,
		height: 720
	})
	await btn.click()
	await expect(el).toHaveText('loaded')
});
