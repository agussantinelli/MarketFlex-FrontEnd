import { test, expect } from '@playwright/test';

test.describe('MarketFlex Foundational Flow', () => {

    test('should complete the foundational flow: Login -> Find Product -> View Detail', async ({ page }) => {
        // --- 1. LOGIN PHASE ---
        console.log('--- Phase 1: Authentication ---');
        console.log('Navigating to home page...');
        await page.goto('/');

        console.log('Waiting for login button...');
        const loginBtn = page.locator('a[href="/login"]').first();
        await expect(loginBtn).toBeVisible({ timeout: 15000 });
        await loginBtn.click();

        console.log('Filling credentials...');
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
        await page.locator('input#email').first().fill('user@gmail.com');
        await page.locator('input#password').first().fill('123');

        console.log('Submitting login form...');
        const submitBtn = page.locator('button.btn-login').first();
        await expect(submitBtn).toBeVisible({ timeout: 10000 });
        await submitBtn.click();

        console.log('Verifying successful login redirect...');
        await expect(page).toHaveURL(/\/\?login_success=true/, { timeout: 15000 });

        const userGreeting = page.locator('#user-name');
        await expect(userGreeting).toBeVisible({ timeout: 10000 });
        await expect(userGreeting).not.toHaveText(/Usuario/i, { timeout: 5000 });
        console.log('Login successful!');

        // --- 2. PRODUCT DISCOVERY PHASE ---
        console.log('--- Phase 2: Product Discovery ---');

        console.log('Waiting for Offers section to be visible...');
        const offersSection = page.locator('section#offers');
        await expect(offersSection).toBeVisible({ timeout: 15000 });

        // Ensure content is loaded and scrolled into view
        await offersSection.scrollIntoViewIfNeeded();

        console.log('Locating first product in Offers...');
        // Use a more robust selector that doesn't depend on fragile CSS module hashes
        const firstProductLink = offersSection.locator('a[href^="/productos/"]').first();
        await expect(firstProductLink).toBeVisible({ timeout: 10000 });

        const productName = await firstProductLink.locator('h3').textContent();
        console.log(`Selecting product: ${productName?.trim()}`);

        console.log('Navigating to Product Detail Page (PDP)...');
        // Wait for the element to be stable before clicking
        await firstProductLink.scrollIntoViewIfNeeded();
        await firstProductLink.click();

        console.log('Waiting for navigation to PDP...');
        await expect(page).toHaveURL(/\/productos\//, { timeout: 15000 });

        const pdpTitle = page.locator('h1').first();
        await expect(pdpTitle).toBeVisible({ timeout: 10000 });

        const actualTitle = await pdpTitle.textContent();
        console.log(`Arrived at PDP. Expected: ${productName?.trim()}, Found: ${actualTitle?.trim()}`);

        await expect(pdpTitle).toHaveText(productName?.trim() || '', { timeout: 10000 });

        console.log('--- Foundational Flow Completed Successfully! ---');
    });


    // Transitorio hasta que swe arme la logica de carrito y se incorpore la API de MP.
});
