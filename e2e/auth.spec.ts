import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should redirect unauthenticated users from admin", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should redirect unauthenticated users from customer area", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/.*login/)
  })
})
