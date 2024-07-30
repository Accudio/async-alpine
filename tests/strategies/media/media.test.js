import { test, expect } from '@playwright/test'

test('strategies/media', async ({ page }) => {
  await page.goto('/tests/strategies/media/')

	await expect(page.getByTestId('width')).toBeEmpty()
	await page.setViewportSize({
		width: 375,
		height: 667
	})
	await expect(page.getByTestId('width'))
		.toHaveText('loaded (max-width: 820px)')

	await expect(page.getByTestId('motion')).toBeEmpty()
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await expect(page.getByTestId('motion'))
		.toHaveText('loaded (prefers-reduced-motion: reduce)')
});
