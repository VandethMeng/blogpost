import { test, expect } from "@playwright/test";

test.describe("Blog Posts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display existing posts on homepage", async ({ page }) => {
    // Check if posts container is visible
    await expect(
      page.locator('.posts-container, [data-testid="posts-list"]').first(),
    ).toBeVisible();
  });

  test("should create a new post when authenticated", async ({ page }) => {
    // Login first
    const timestamp = Date.now();
    const email = `postauthor${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Create a post
    const postTitle = `E2E Test Post ${timestamp}`;
    const postContent = "This is a test post created by Playwright E2E test.";

    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page.getByPlaceholder(/content/i).fill(postContent);
    await page.getByRole("button", { name: /create post/i }).click();

    // Verify post appears on the page
    await expect(page.getByText(postTitle)).toBeVisible();
    await expect(page.getByText(postContent)).toBeVisible();
  });

  test("should not show create post form when not authenticated", async ({
    page,
  }) => {
    // Should not see post form placeholders for unauthenticated users
    const titleInput = page.getByPlaceholder(/title/i);

    // Either hidden or not present
    await expect(titleInput)
      .not.toBeVisible()
      .catch(() => expect(titleInput).toHaveCount(0));
  });

  test("should edit own post", async ({ page }) => {
    // Login and create a post
    const timestamp = Date.now();
    const email = `editauthor${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Create post
    const postTitle = `Edit Test ${timestamp}`;
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page.getByPlaceholder(/content/i).fill("Original content");
    await page.getByRole("button", { name: /create post/i }).click();
    await expect(page.getByText(postTitle)).toBeVisible();

    // Edit the post
    const postContainer = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postContainer.getByRole("button", { name: /edit/i }).click();

    // Update content
    const editInput = page.locator(
      'textarea[value="Original content"], input[value="Original content"]',
    );
    await editInput.clear();
    await editInput.fill("Updated content via E2E test");
    await page.getByRole("button", { name: /save/i }).click();

    // Verify updated content
    await expect(page.getByText("Updated content via E2E test")).toBeVisible();
  });

  test("should delete own post", async ({ page }) => {
    // Login and create a post
    const timestamp = Date.now();
    const email = `deleteauthor${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Create post
    const postTitle = `Delete Test ${timestamp}`;
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page.getByPlaceholder(/content/i).fill("Content to be deleted");
    await page.getByRole("button", { name: /create post/i }).click();
    await expect(page.getByText(postTitle)).toBeVisible();

    // Delete the post
    const postContainer = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postContainer.getByRole("button", { name: /delete/i }).click();

    // Verify post is removed
    await expect(page.getByText(postTitle)).not.toBeVisible();
  });

  test("should display posts in chronological order", async ({ page }) => {
    // Login
    const timestamp = Date.now();
    const email = `chronouser${timestamp}@example.com`;
    const password = "Test@123";

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();

    // Create multiple posts with delays
    for (let i = 1; i <= 3; i++) {
      await page
        .getByPlaceholder(/title/i)
        .fill(`Chrono Post ${i} ${timestamp}`);
      await page.getByPlaceholder(/content/i).fill(`Content ${i}`);
      await page.getByRole("button", { name: /create post/i }).click();
      await page.waitForTimeout(500); // Small delay between posts
    }

    // Get all post titles
    const posts = page.locator("h2, h3").filter({ hasText: `Chrono Post` });
    await expect(posts).toHaveCount(3);

    // Most recent post should appear first
    const firstPost = posts.first();
    await expect(firstPost).toContainText("Chrono Post 3");
  });
});
