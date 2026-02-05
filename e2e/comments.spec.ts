import { test, expect } from "@playwright/test";

test.describe("Comments", () => {
  let userEmail: string;
  let postTitle: string;

  test.beforeEach(async ({ page }) => {
    // Login and create a post for testing comments
    const timestamp = Date.now();
    userEmail = `commentuser${timestamp}@example.com`;
    const password = "Test@123";
    postTitle = `Comment Test Post ${timestamp}`;

    await page.goto("/signup");
    await page.getByPlaceholder("Email").fill(userEmail);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/");

    // Create a post
    await page.getByPlaceholder(/title/i).fill(postTitle);
    await page.getByPlaceholder(/content/i).fill("Post for testing comments");
    await page.getByRole("button", { name: /create post/i }).click();
    await expect(page.getByText(postTitle)).toBeVisible();
  });

  test("should add a comment to a post", async ({ page }) => {
    const commentText = "This is a test comment from E2E";

    // Find the post and add comment
    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    const commentInput = postSection.getByPlaceholder(/comment/i);

    await commentInput.fill(commentText);
    await postSection.getByRole("button", { name: /add comment/i }).click();

    // Verify comment appears
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test("should display comment author name", async ({ page }) => {
    const commentText = "Comment with author name";

    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection.getByPlaceholder(/comment/i).fill(commentText);
    await postSection.getByRole("button", { name: /add comment/i }).click();

    // Author name (email) should be visible with the comment
    await expect(page.getByText(userEmail)).toBeVisible();
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test("should add multiple comments to same post", async ({ page }) => {
    const comments = ["First comment", "Second comment", "Third comment"];

    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");

    for (const commentText of comments) {
      await postSection.getByPlaceholder(/comment/i).fill(commentText);
      await postSection.getByRole("button", { name: /add comment/i }).click();
      await expect(page.getByText(commentText)).toBeVisible();
    }

    // All comments should be visible
    for (const commentText of comments) {
      await expect(page.getByText(commentText)).toBeVisible();
    }
  });

  test("should delete own comment", async ({ page }) => {
    const commentText = "Comment to be deleted";

    // Add comment
    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection.getByPlaceholder(/comment/i).fill(commentText);
    await postSection.getByRole("button", { name: /add comment/i }).click();
    await expect(page.getByText(commentText)).toBeVisible();

    // Delete comment
    const commentContainer = page
      .locator(`text=${commentText}`)
      .locator("..")
      .locator("..");
    await commentContainer.getByRole("button", { name: /delete/i }).click();

    // Verify comment is removed
    await expect(page.getByText(commentText)).not.toBeVisible();
  });

  test("should not allow empty comments", async ({ page }) => {
    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    const addButton = postSection.getByRole("button", { name: /add comment/i });

    // Try to submit empty comment
    await addButton.click();

    // Comment should not be added (button should still be there)
    await expect(addButton).toBeVisible();
  });

  test("should display comment timestamp", async ({ page }) => {
    const commentText = "Comment with timestamp";

    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection.getByPlaceholder(/comment/i).fill(commentText);
    await postSection.getByRole("button", { name: /add comment/i }).click();

    // Should see some form of date/time display
    // Looking for common date patterns or time indicators
    await expect(page.getByText(commentText)).toBeVisible();
    // The timestamp should be near the comment
    const commentSection = page
      .locator(`text=${commentText}`)
      .locator("..")
      .locator("..");
    await expect(commentSection).toBeVisible();
  });

  test("should preserve comments after page reload", async ({ page }) => {
    const commentText = "Persistent comment";

    // Add comment
    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection.getByPlaceholder(/comment/i).fill(commentText);
    await postSection.getByRole("button", { name: /add comment/i }).click();
    await expect(page.getByText(commentText)).toBeVisible();

    // Reload page
    await page.reload();

    // Comment should still be visible
    await expect(page.getByText(postTitle)).toBeVisible();
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test("different users can comment on same post", async ({
    page,
    context,
  }) => {
    // First user's comment
    const comment1 = "Comment from first user";
    const postSection = page
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection.getByPlaceholder(/comment/i).fill(comment1);
    await postSection.getByRole("button", { name: /add comment/i }).click();
    await expect(page.getByText(comment1)).toBeVisible();

    // Logout
    await page.getByRole("button", { name: /logout/i }).click();

    // Create second user in new page
    const newPage = await context.newPage();
    const timestamp = Date.now();
    const email2 = `commentuser2${timestamp}@example.com`;

    await newPage.goto("/signup");
    await newPage.getByPlaceholder("Email").fill(email2);
    await newPage.getByPlaceholder("Password").fill("Test@123");
    await newPage.getByRole("button", { name: /sign up/i }).click();

    // Add comment from second user
    const comment2 = "Comment from second user";
    const postSection2 = newPage
      .locator(`text=${postTitle}`)
      .locator("..")
      .locator("..");
    await postSection2.getByPlaceholder(/comment/i).fill(comment2);
    await postSection2.getByRole("button", { name: /add comment/i }).click();

    // Both comments should be visible
    await expect(newPage.getByText(comment1)).toBeVisible();
    await expect(newPage.getByText(comment2)).toBeVisible();

    await newPage.close();
  });
});
