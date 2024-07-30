import { test, expect } from '@playwright/test'

test('alpine/x-transition', async ({ page }) => {
  await page.goto('/tests/alpine/transition/')
	await page.getByTestId('button').click()
	// Not ideal. Just tests that the computed CSS transition isn't the default, so doesn't
	// actually tell us Alpine's transition worked. I think it's an okay basic confirmation.
	await expect(page.getByTestId('test'))
		.not.toHaveCSS('transition', 'all 0s ease 0s')
});
