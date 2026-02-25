import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'html',
    use: {
        baseURL: 'https://localhost:2611',
        trace: 'on',
        ignoreHTTPSErrors: true,
        screenshot: 'on',
        video: 'on',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    /* 
       Manual setup is recommended for local development to avoid memory limits:
       1. Run 'pnpm dev' (FrontEnd)
       2. Run 'pnpm dev' (BackEnd)
       3. Run 'pnpm test:e2e'
    */
    /* 
    webServer: {
        command: 'pnpm dev --port 2611',
        url: 'https://localhost:2611',
        reuseExistingServer: true,
        timeout: 120000,
    },
    */
});
