import { test, expect } from "@playwright/test"

test.describe("Admin Area", () => {
  test("should require authentication for admin dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should require authentication for admin bookings", async ({ page }) => {
    await page.goto("/admin/bookings")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should require authentication for admin reports", async ({ page }) => {
    await page.goto("/admin/reports")
    await expect(page).toHaveURL(/.*login/)
  })
})
