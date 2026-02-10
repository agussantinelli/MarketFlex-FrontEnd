---
name: test
description: Guidelines for frontend component and E2E testing.
---

# Testing (FrontEnd)

## Context
Quality assurance in the frontend involves checking both individual component logic and the overall user flow.

## Guidelines
1. **Component Testing**: Use Vitest for unit testing Astro components and helper functions.
2. **E2E Testing**: Use Playwright or Cypress for full-flow tests.
3. **Accessibility**: Run `axe` or similar tools regularly to ensure WCAG compliance.
4. **Mocking**: Use MSW (Mock Service Worker) to mock API responses during development/testing.
5. **Snapshots**: Use snapshot testing sparingly for very stable UI components.
