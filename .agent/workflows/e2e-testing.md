---
description: How to run End-to-End (E2E) tests in MarketFlex
---

# E2E Testing Workflow

This workflow describes how to run and debug the **Foundational Flow** test (Login -> Discovery -> PDP -> Cart).

## Local Execution

1. **Start the Backend**:
   - Navigate to the Backend directory.
   - Run `pnpm dev`.

2. **Start the Frontend**:
   - Navigate to the Frontend directory.
   - Run `pnpm dev` (this starts the server on `https://localhost:2611`).

3. **Run E2E Tests**:
   // turbo
   - Run `pnpm test:e2e` to execute tests in **headed mode** (visible Chromium browser).

4. **Debug with UI Mode**:
   - Run `pnpm test:e2e:ui` to open the Playwright interactive UI.

## CI/CD (GitHub Actions)

Tests are automatically run on every push and pull request to `main`, `master`, and `develop` branches.
The workflow is defined in [.github/workflows/frontend-tests.yml](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.github/workflows/frontend-tests.yml).

> [!IMPORTANT]
> Because the tests run in **headed mode** by default locally, ensure you have a display environment available. In CI, Playwright will automatically handle the headless state if configured correctly in the config file (e.g., via `process.env.CI`).
