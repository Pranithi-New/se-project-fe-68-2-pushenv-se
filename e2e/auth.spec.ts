import { test, expect } from "@playwright/test";

test.describe("Authentication (Epic 1)", () => {
  test("TC-US1-1-01: User Registration (Happy Path)", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Name").click();
    await page.getByLabel("Name").pressSequentially("John Doe", { delay: 30 });

    const randomEmail = `test_${Math.floor(Math.random() * 10000)}@example.com`;
    await page.getByLabel("Email").click();
    await page
      .getByLabel("Email")
      .pressSequentially(randomEmail, { delay: 30 });

    await page.getByLabel("Password", { exact: true }).click();
    await page
      .getByLabel("Password", { exact: true })
      .pressSequentially("SecurePass123!", { delay: 30 });

    await page.getByLabel("Confirm Password").click();
    await page
      .getByLabel("Confirm Password")
      .pressSequentially("SecurePass123!", { delay: 30 });

    const policyLink = page.getByRole("link", { name: "Privacy Policy" });
    await policyLink.click();

    const consentCheckbox = page.locator("#consent-checkbox");
    await expect(consentCheckbox).toBeEnabled();
    await consentCheckbox.check();

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Registration successful!")).toBeVisible();
    await expect(page).toHaveURL("/events");
  });

  test("TC-US1-1-02: User Registration (Invalid Inputs)", async ({ page }) => {
    await page.goto("/signup");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Invalid email format")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    await expect(
      page.getByText("You must accept the Privacy Policy"),
    ).toBeVisible();
  });

  test("TC-US1-1-03: User Registration (Email already exists)", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.getByLabel("Name").click();
    await page.getByLabel("Name").pressSequentially("John Doe", { delay: 30 });

    await page.getByLabel("Email").click();
    await page
      .getByLabel("Email")
      .pressSequentially("test@jobseeker.com", { delay: 30 });

    await page.getByLabel("Password", { exact: true }).click();
    await page
      .getByLabel("Password", { exact: true })
      .pressSequentially("SecurePass123!", { delay: 30 });

    await page.getByLabel("Confirm Password").click();
    await page
      .getByLabel("Confirm Password")
      .pressSequentially("SecurePass123!", { delay: 30 });

    const policyLink = page.getByRole("link", { name: "Privacy Policy" });
    await policyLink.click();

    const consentCheckbox = page.locator("#consent-checkbox");
    await expect(consentCheckbox).toBeEnabled();
    await consentCheckbox.check();

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Email already exists")).toBeVisible();
  });

  test("TC-US1-2-01: User Login (Happy Path)", async ({ page }) => {
    await page.goto("/signin");

    const emailField = page.getByLabel("Email");
    await emailField.click();
    await emailField.pressSequentially("test@jobseeker.com", { delay: 30 });

    const passField = page.getByLabel("Password");
    await passField.click();
    await passField.pressSequentially("password123", { delay: 30 });

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Welcome back!")).toBeVisible();
    await expect(page).toHaveURL("/events");
  });

  test("TC-US1-2-02: User Login (Invalid Credentials)", async ({ page }) => {
    await page.goto("/signin");

    const emailField = page.getByLabel("Email");
    await emailField.click();
    await emailField.pressSequentially("ghost@test.com", { delay: 30 });

    const passField = page.getByLabel("Password");
    await passField.click();
    await passField.pressSequentially("wrongpassword", { delay: 30 });

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("TC-US1-3-01: View Profile when logged in", async ({ page }) => {
    await page.goto("/signin");

    const emailField = page.getByLabel("Email");
    await emailField.click();
    await emailField.pressSequentially("test@jobseeker.com", { delay: 30 });

    const passField = page.getByLabel("Password");
    await passField.click();
    await passField.pressSequentially("password123", { delay: 30 });

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/events");

    await page.goto("/profile");

    await expect(page.getByText("Personal Information")).toBeVisible();
    await expect(page.getByText("test@jobseeker.com").first()).toBeVisible();
  });

  test("TC-US1-3-02: View Profile when not logged in", async ({ page }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/signin/);
  });

  test("TC-US1-4-01: Edit Account Details (Valid)", async ({ page }) => {
    await page.goto("/signin");
    const emailField = page.getByLabel("Email");
    await emailField.click();
    await emailField.pressSequentially("test@jobseeker.com", { delay: 30 });

    const passField = page.getByLabel("Password");
    await passField.click();
    await passField.pressSequentially("password123", { delay: 30 });

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/events");

    await page.goto("/profile");

    await page.getByRole("button", { name: "Edit" }).first().click();

    await page.locator('div:has(> label:text-is("Full Name")) input').click();
    await page.locator('div:has(> label:text-is("Full Name")) input').fill("");
    await page
      .locator('div:has(> label:text-is("Full Name")) input')
      .pressSequentially("Jane Doe", { delay: 30 });

    await page.locator('div:has(> label:text-is("Phone")) input').click();
    await page.locator('div:has(> label:text-is("Phone")) input').fill("");
    await page
      .locator('div:has(> label:text-is("Phone")) input')
      .pressSequentially("0812345678", { delay: 30 });

    await page.getByRole("button", { name: "Save" }).first().click();

    await expect(page.getByText("Profile updated")).toBeVisible();
    await expect(page.getByText("Jane Doe").first()).toBeVisible();
  });

  test("TC-US1-4-02: Edit Account Details (Invalid)", async ({ page }) => {
    await page.goto("/signin");
    const emailField = page.getByLabel("Email");
    await emailField.click();
    await emailField.pressSequentially("test@jobseeker.com", { delay: 30 });

    const passField = page.getByLabel("Password");
    await passField.click();
    await passField.pressSequentially("password123", { delay: 30 });

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL("/events");

    await page.goto("/profile");

    await page.getByRole("button", { name: "Edit" }).first().click();

    await page.locator('div:has(> label:text-is("Full Name")) input').click();
    await page.locator('div:has(> label:text-is("Full Name")) input').fill("");
    await page.getByRole("button", { name: "Save" }).first().click();

    const errorToast = page.locator(
      'ol[data-sonner-toaster] li[data-type="error"]',
    );
    await expect(errorToast).toBeVisible();
  });
});
