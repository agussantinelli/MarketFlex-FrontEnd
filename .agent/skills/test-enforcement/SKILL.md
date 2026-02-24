---
name: test-enforcement
description: Mandatory rule requiring a corresponding test file for every component and logic file.
---

# Test Enforcement (FrontEnd)

## Context
Frontend components and complex logic are critical to user experience. Every meaningful logic file or component MUST have a corresponding test.

## Guidelines
1. **Rule of One**: Every `.astro`, `.ts`, or `.js` file in `src/components`, `src/services`, or `src/utils` MUST have a matching `.test.ts`, `.spec.ts`, or `.test.js` file.
2. **Location**: Test files should be located in the same directory as the source file.
3. **Naming**: If the source is `ProductCard.astro`, the test should be `ProductCard.test.ts`.
4. **Content**: Tests should verify that components render correctly and that utility/service functions return expected results.

## Examples

### Correct Structure
```
src/components/
├── ProductCard.astro
└── ProductCard.test.ts
```

### Incorrect Structure (Missing Test)
```
src/components/
└── ProductCard.astro
(Error: Missing ProductCard.test.ts)
```
