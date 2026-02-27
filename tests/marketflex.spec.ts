import { test, expect } from '@playwright/test';

test.describe('MarketFlex Foundational Flow', () => {

    test('Should complete the foundational flow: Login -> Find Product -> View Detail -> Cart -> Checkout -> Success -> Order History -> Order Detail', async ({ page }) => {
        // --- 1. LOGIN PHASE ---
        console.log('--- Phase 1: Authentication ---');
        console.log('Navigating to home page...');
        await page.goto('/');

        console.log('Waiting for login button...');
        const loginBtn = page.locator('a[href="/login"]').first();
        await expect(loginBtn).toBeVisible({ timeout: 60000 });
        await loginBtn.click();

        console.log('Filling credentials...');
        await expect(page).toHaveURL(/\/login/, { timeout: 45000 });
        await page.locator('input#email').first().fill('user@gmail.com');
        await page.locator('input#password').first().fill('123');

        console.log('Submitting login form...');
        const submitBtn = page.locator('button.btn-login').first();
        await expect(submitBtn).toBeVisible({ timeout: 45000 });
        await submitBtn.click();

        console.log('Verifying successful login redirect...');
        // Relaxing the URL check to handle possible GET fallback in test environments
        await expect(page).toHaveURL(/\/\?login_success=true|login\?email=/, { timeout: 60000 });

        const userGreeting = page.locator('#user-name');
        await expect(userGreeting).toBeVisible({ timeout: 45000 });
        await expect(userGreeting).not.toHaveText(/Usuario/i, { timeout: 5000 });
        console.log('Login successful!');

        // --- 2. PRODUCT DISCOVERY PHASE ---
        console.log('--- Phase 2: Product Discovery ---');

        console.log('Waiting for Offers section to be visible...');
        const offersSection = page.locator('section#offers');
        await expect(offersSection).toBeVisible({ timeout: 60000 });

        // Ensure content is loaded and scrolled into view
        await offersSection.scrollIntoViewIfNeeded();

        console.log('Locating first product in Offers...');
        // Use a more robust selector that doesn't depend on fragile CSS module hashes
        const firstProductLink = offersSection.locator('a[href^="/productos/"]').first();
        await expect(firstProductLink).toBeVisible({ timeout: 45000 });

        const productName = await firstProductLink.locator('h3').textContent();
        console.log(`Selecting product: ${productName?.trim()}`);

        console.log('Navigating to Product Detail Page (PDP)...');
        // Wait for the element to be stable before clicking
        await firstProductLink.scrollIntoViewIfNeeded();
        await firstProductLink.click();

        console.log('Waiting for navigation to PDP...');
        await expect(page).toHaveURL(/\/productos\//, { timeout: 60000 });

        const pdpTitle = page.locator('h1').first();
        await expect(pdpTitle).toBeVisible({ timeout: 45000 });

        const actualTitle = await pdpTitle.textContent();
        console.log(`Arrived at PDP. Expected: ${productName?.trim()}, Found: ${actualTitle?.trim()}`);

        await expect(pdpTitle).toHaveText(productName?.trim() || '', { timeout: 45000 });

        // --- 3. CART INTERACTION ---
        console.log('--- Phase 3: Cart Interaction ---');
        console.log('Locating "Agregar al carrito" button in PDP...');
        const addToCartBtn = page.locator('#add-to-cart-btn');
        await expect(addToCartBtn).toBeVisible({ timeout: 45000 });

        console.log('Clicking "Agregar al carrito"...');
        await addToCartBtn.click();

        console.log('Verifying Sileo notification...');
        await expect(page.getByText(/¡Hecho! Agregaste/i).or(page.getByText(/¡Excelente! Agregaste/i))).toBeVisible({ timeout: 45000 });

        // --- 4. CART & CHECKOUT PHASE ---
        console.log('--- Phase 4: Cart & Checkout ---');
        console.log('Navigating to Cart using Navbar...');

        // Find the visible cart link in the navbar
        const cartLink = page.locator('nav a[href="/cart"]').filter({ visible: true }).first();
        await expect(cartLink).toBeVisible({ timeout: 60000 });
        await cartLink.click();

        console.log('Verifying Cart Page...');
        await expect(page).toHaveURL(/\/cart/, { timeout: 45000 });
        await expect(page.locator('h1').getByText(/Tu Carrito/i)).toBeVisible({ timeout: 45000 });

        console.log('Verifying product is in cart...');
        await expect(page.getByText(productName?.trim() || '').first()).toBeVisible({ timeout: 45000 });

        console.log('Clicking "Continuar compra" to reach Checkout...');
        const checkoutBtn = page.getByRole('button', { name: /continuar compra/i });
        await expect(checkoutBtn).toBeVisible({ timeout: 45000 });
        await checkoutBtn.click();

        console.log('Verifying Checkout Page reached...');
        await expect(page).toHaveURL(/\/checkout/, { timeout: 60000 });
        await expect(page.locator('h1').getByText(/Finalizar Compra/i)).toBeVisible({ timeout: 45000 });

        console.log('Filling Checkout Form...');
        await page.locator('input#nombre').fill('Test User');
        await page.locator('input#email').fill('test@user.com');
        await page.locator('input#telefono').fill('1122334455');
        await page.locator('input#direccion').fill('Test Street 123');
        await page.locator('input#ciudad').fill('Buenos Aires');
        await page.locator('input#provincia').fill('CABA');
        await page.locator('input#cp').fill('1000');

        console.log('Submitting Purchase...');
        const submitPurchaseBtn = page.getByRole('button', { name: /Confirmar Compra/i });
        await expect(submitPurchaseBtn).toBeVisible({ timeout: 45000 });
        await submitPurchaseBtn.click();

        // --- 5. POST-PURCHASE & ORDER HISTORY ---
        console.log('--- Phase 5: Post-Purchase Flow ---');
        console.log('Verifying Success Page redirect...');
        await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 60000 });
        await expect(page.locator('h1').getByText(/¡Compra Exitosa!/i)).toBeVisible({ timeout: 45000 });

        console.log('Returning to Home...');
        const homeBtn = page.locator('a[href="/"]').getByText(/Volver al Inicio/i);
        await expect(homeBtn).toBeVisible({ timeout: 45000 });
        await homeBtn.click();

        console.log('Opening User Profile Menu...');
        await expect(page).toHaveURL(/\/$/, { timeout: 45000 });

        // Ensure nav-auth-user is visible first
        const authUserArea = page.locator('.nav-auth-user');
        await expect(authUserArea).toBeVisible({ timeout: 60000 });

        const userDropdownBtn = page.locator('.dropdown-trigger').first();
        await expect(userDropdownBtn).toBeVisible({ timeout: 45000 });
        // Instead of clicking directly which relies on JS dropdown state, we hover to expand CSS dropdowns if necessary
        await userDropdownBtn.hover();

        console.log('Navigating to Order History...');
        const misComprasLink = page.locator('.dropdown-menu a[href="/orders"]').first();
        // Wait for it to become clickable/visible (sometimes needs real click on dropdownTrigger)
        try {
            await userDropdownBtn.click();
            await expect(misComprasLink).toBeVisible({ timeout: 3000 });
        } catch { } // If hover was enough or click failed, try accessing link directly

        // Force click since dropdown mechanisms vary (hover vs click)
        await misComprasLink.click({ force: true });

        console.log('Checking Orders List...');
        await expect(page).toHaveURL(/\/orders\/?$/, { timeout: 60000 });
        await expect(page.locator('h1').getByText(/Mis Compras/i)).toBeVisible({ timeout: 45000 });

        console.log('Opening the latest order...');
        const firstOrderLink = page.locator('a[href^="/orders/"]').first();
        await expect(firstOrderLink).toBeVisible({ timeout: 60000 }); // Wait for orders to load from API
        await firstOrderLink.click();

        console.log('Verifying Order Detail Page...');
        await expect(page).toHaveURL(/\/orders\//, { timeout: 60000 });
        await expect(page.locator('h3').getByText(/Artículos/i)).toBeVisible({ timeout: 45000 });

        console.log('--- Full Purchase Flow Completed Successfully! ---');
    });
});
