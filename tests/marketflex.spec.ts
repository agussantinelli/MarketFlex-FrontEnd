import { test, expect } from '@playwright/test';

/**
 * foundational E2E Test Suite for MarketFlex
 * 
 * TODO: Complete this suite when Cart and Mercado Pago logic are finalized.
 * Current Scope: Core navigation, Authentication, and Product Discovery.
 */

test.describe('MarketFlex foundational Flow', () => {

    test('should navigate to login and authenticate successfully', async ({ page }) => {
        // Start from home
        await page.goto('/');
        await expect(page).toHaveTitle(/MarketFlex | Premium Marketplace/);

        // Navigate to login via Navbar
        const loginBtn = page.locator('a[href="/login"]').first();
        await expect(loginBtn).toBeVisible();
        await loginBtn.click();

        // Verify we are on login page
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('h1')).toHaveText('Bienvenido de nuevo');

        // Fill login form with seeder credentials
        await page.fill('input#email', 'user@gmail.com');
        await page.fill('input#password', '123');
        await page.click('button.btn-login');

        // Verify successful login redirection (should return to home with success param)
        // Note: auth-login.ts redirects to /?login_success=true&user=...
        await expect(page).toHaveURL(/\/\?login_success=true/);

        // Verify User Greeting in Navbar
        const userGreeting = page.locator('#user-name');
        await expect(userGreeting).toBeVisible();
        await expect(userGreeting).not.toHaveText('Usuario');
    });

    test('should find a product in Offers and navigate to Detail Page', async ({ page }) => {
        await page.goto('/');

        // Locate the Offers carousel section
        const offersSection = page.locator('section#offers');
        await expect(offersSection).toBeVisible();

        // Find the first product card in the carousel
        const firstProductCard = offersSection.locator('[class*="ProductCard_productCard"]').first();
        await expect(firstProductCard).toBeVisible();

        // Get product name for verification
        const productName = await firstProductCard.locator('h3').textContent();

        // Click on the product to go to PDP
        await firstProductCard.click();

        // Verify navigation to PDP
        await expect(page).toHaveURL(/\/productos\//);

        // Verify product name in PDP header
        const pdpTitle = page.locator('h1');
        await expect(pdpTitle).toHaveText(productName || '');

        console.log(`Successfully navigated to PDP for: ${productName}`);
    });

    // --- FUTURE SCOPE: To be implemented ---
    // test('should add product to cart and proceed to checkout', async ({ page }) => {
    //     // Logic pending: Cart & Mercado Pago integration
    // });

});
