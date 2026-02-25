import { test, expect } from '@playwright/test';

test.describe('MarketFlex Foundational Flow', () => {

    test('should navigate to login and authenticate successfully', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/MarketFlex | Premium Marketplace/);

        const loginBtn = page.locator('a[href="/login"]').first();
        await expect(loginBtn).toBeVisible();
        await loginBtn.click();

        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('h1')).toHaveText('Bienvenido de nuevo');

        await page.fill('input#email', 'user@gmail.com');
        await page.fill('input#password', '123');
        await page.click('button.btn-login');

        await expect(page).toHaveURL(/\/\?login_success=true/);

        const userGreeting = page.locator('#user-name');
        await expect(userGreeting).toBeVisible();
        await expect(userGreeting).not.toHaveText('Usuario');
    });

    test('should find a product in Offers and navigate to Detail Page', async ({ page }) => {
        await page.goto('/');

        const offersSection = page.locator('section#offers');
        await expect(offersSection).toBeVisible();

        const firstProductCard = offersSection.locator('[class*="ProductCard_productCard"]').first();
        await expect(firstProductCard).toBeVisible();

        const productName = await firstProductCard.locator('h3').textContent();

        await firstProductCard.click();

        await expect(page).toHaveURL(/\/productos\//);

        const pdpTitle = page.locator('h1');
        await expect(pdpTitle).toHaveText(productName || '');

        console.log(`Successfully navigated to PDP for: ${productName}`);
    });

});
