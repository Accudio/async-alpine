import { test, expect } from '@playwright/test'

test('misc/nested', async ({ page }) => {
  await page.goto('/tests/misc/nested/')

	let lastLoad
	let outer = false
	let inner = false

	// check both components but also track which one triggered last so we know they triggered in the right order
	await Promise.all([
		expect(page.getByTestId('outer'))
			.toHaveText('outer component loaded')
			.then(() => {
				lastLoad = 'outer'
				if (outer) {
					outer = 'duplicate'
				} else {
					outer = 'seen'
				}
			}),

		expect(page.getByTestId('inner'))
			.toHaveText('inner component loaded')
			.then(() => {
				lastLoad = 'inner'
				if (inner) {
					inner = 'duplicate'
				} else {
					inner = 'seen'
				}
			}),
	])

	// confirm that the last one loaded was inner and we don't have dupes
	expect(lastLoad).toBe('inner')
	expect(outer).toBe('seen')
	expect(inner).toBe('seen')
});
