import { test, expect } from "@playwright/test"

test.describe("Customer Area", () => {
  test("should require authentication for dashboard", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should require authentication for bookings", async ({ page }) => {
    await page.goto("/bookings")
    await expect(page).toHaveURL(/.*login/)
  })
})
