import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login and signup links on homepage", async ({
    page,
  }) => {
    await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByText("Sign Up")).toBeVisible();
  });

  test("should navigate to signup page and display form", async ({ page }) => {
    await page.getByText("Sign Up").click();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });

  test("should successfully sign up a new user", async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = "Test@123";

    // Navigate to signup
    await page.goto("/signup");

    // Fill form
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);

    // Submit form
    await page.getByRole("button", { name: /sign up/i }).click();

    // Should redirect to home page after successful signup
    await expect(page).toHaveURL("/");

    // Should show user email in navigation
    await expect(page.getByText(email)).toBeVisible();
  });

  test("should successfully log in existing user", async ({ page }) => {
    // First create a user
    const timestamp = Date.now();
    const email = `loginuser${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Logout
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page.getByText("Login")).toBeVisible();

    // Login with same credentials
    await page.getByText("Login").click();
    await expect(page).toHaveURL("/login");

    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /login/i }).click();

    // Should be logged in
    await expect(page).toHaveURL("/");
    await expect(page.getByText(email)).toBeVisible();
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("nonexistent@example.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /login/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("should logout user successfully", async ({ page }) => {
    // Create and login user
    const timestamp = Date.now();
    const email = `logoutuser${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Logout
    await page.getByRole("button", { name: /logout/i }).click();

    // Should show login/signup links again
    await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByText("Sign Up")).toBeVisible();
  });

  test("should prevent duplicate email registration", async ({ page }) => {
    const email = "duplicate@example.com";
    const password = "Test@123";

    // First registration
    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Logout
    await page.getByRole("button", { name: /logout/i }).click();

    // Try to register with same email
    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();

    // Should show error message
    await expect(page.getByText(/exists/i)).toBeVisible();
  });
});
