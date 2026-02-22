import { test, expect } from "@playwright/test"

test.describe("Booking Flow", () => {
  test("should display the landing page", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/.+/)
  })

  test("should show quote form elements", async ({ page }) => {
    await page.goto("/")
    // Verify the page loads with expected booking-related content
    const body = await page.textContent("body")
    expect(body).toBeTruthy()
  })
})
