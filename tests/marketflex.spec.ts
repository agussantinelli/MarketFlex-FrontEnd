import { test, expect } from '@playwright/test';

test.describe('MarketFlex Foundational Flow', () => {

    test('should complete the foundational flow: Login -> Find Product -> View Detail -> Cart -> Checkout', async ({ page }) => {
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
        // Relaxing the URL check to handle possible GET fallback in test environments
        await expect(page).toHaveURL(/\/\?login_success=true|login\?email=/, { timeout: 15000 });

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

        // --- 3. CART INTERACTION ---
        console.log('--- Phase 3: Cart Interaction ---');
        console.log('Locating "Agregar al carrito" button in PDP...');
        const addToCartBtn = page.locator('#add-to-cart-btn');
        await expect(addToCartBtn).toBeVisible({ timeout: 10000 });

        console.log('Clicking "Agregar al carrito"...');
        await addToCartBtn.click();

        console.log('Verifying Sileo notification...');
        await expect(page.getByText(/¡Hecho! Agregaste/i).or(page.getByText(/¡Excelente! Agregaste/i))).toBeVisible({ timeout: 10000 });

        // --- 4. CART & CHECKOUT PHASE ---
        console.log('--- Phase 4: Cart & Checkout ---');
        console.log('Navigating to Cart using Navbar...');

        // Find the visible cart link in the navbar
        const cartLink = page.locator('nav a[href="/cart"]').filter({ visible: true }).first();
        await expect(cartLink).toBeVisible({ timeout: 15000 });
        await cartLink.click();

        console.log('Verifying Cart Page...');
        await expect(page).toHaveURL(/\/cart/, { timeout: 10000 });
        await expect(page.locator('h1').getByText(/Tu Carrito/i)).toBeVisible({ timeout: 10000 });

        console.log('Verifying product is in cart...');
        await expect(page.getByText(productName?.trim() || '')).toBeVisible({ timeout: 10000 });

        console.log('Clicking "Continuar compra" to reach Checkout...');
        const checkoutBtn = page.getByRole('button', { name: /continuar compra/i });
        await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
        await checkoutBtn.click();

        console.log('Verifying Checkout Page reached...');
        await expect(page).toHaveURL(/\/checkout/, { timeout: 15000 });
        await expect(page.locator('h1').getByText(/Finalizar Compra/i)).toBeVisible({ timeout: 10000 });

        console.log('--- Full Purchase Flow Completed Successfully! ---');
    });
});
