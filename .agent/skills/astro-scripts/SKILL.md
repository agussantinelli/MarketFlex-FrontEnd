---
name: astro-scripts
description: Guidelines for managing JavaScript/TypeScript in Astro components, enforcing extraction of complex logic.
---

# Astro Scripts Skill

## Context
Astro components (`.astro`) allow embedding scripts directly. However, to maintain readability and modularity, complex logic should be extracted to external files.

## Guidelines

1. **Extraction Rule**: Any script within an Astro component that exceeds **25 lines** of code (excluding boilerplate/imports) MUST be extracted to a dedicated TypeScript file.
2. **Directory Structure**: Extracted scripts must be placed in `src/scripts/`.
3. **Naming Convention**: 
    - Use descriptive, kebab-case names.
    - Suffix the file with the feature it handles (e.g., `auth-login.ts`, `navbar-logic.ts`).
4. **Encapsulation**:
    - Avoid global variables where possible.
    - Export initialization functions (e.g., `initNavbar()`, `setupSearch()`).
5. **View Transitions Support**: 
    - When extracting scripts, ensure they are compatible with Astro's View Transitions by wrapping initialization logic in functions that can be re-called on `astro:page-load`.

## Example

### Before (`MyComponent.astro`)
```html
<script>
  // 30 lines of logic here...
</script>
```

### After (`src/scripts/my-logic.ts`)
```typescript
export function initMyLogic() {
  // logic here...
}
```

### After (`MyComponent.astro`)
```html
<script>
  import { initMyLogic } from '../scripts/my-logic';
  initMyLogic();
  document.addEventListener('astro:page-load', initMyLogic);
</script>
```
