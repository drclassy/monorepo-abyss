import { expect, test } from '@playwright/test'

const criticalRoutes = ['/dashboard/default', '/dashboard/crm', '/dashboard/analytics'] as const

test.describe('sentra-portal smoke', () => {
  for (const route of criticalRoutes) {
    test(route + ' returns 200', async ({ page }) => {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(res?.ok()).toBeTruthy()
      await expect(page.locator('body')).toBeVisible()
    })
  }
})
