---
name: css-modules
description: Guidelines for implementing CSS Modules in Astro components for better maintainability and scoped styling.
---

# CSS Modules Skill

## Context
Astro provides scoped styles by default. However, to maintain a clean directory structure and standard modularity, complex CSS should be extracted to CSS Module files (`.module.css`).

## Guidelines

1. **Extraction Rule**: Any significant CSS block (typically >20 lines or reused logic) SHOULD be moved to a CSS Module file.
2. **Directory Structure**: 
    - Create a `styles/` subdirectory within the component's folder.
    - Path: `src/components/[category]/styles/[ComponentName].module.css`.
    - For pages: `src/pages/styles/[PageName].module.css`.
3. **Naming Convention**: 
    - Use `PascalCase` or `kebab-case` matching the component name.
    - Always use the `.module.css` extension.
4. **Integration**:
    - Import the styles in the frontmatter of the `.astro` file:
      `import styles from './styles/MyComponent.module.css';`
    - Apply classes using the `class={styles.className}` syntax.
    - For multiple classes, use template literals: `class={`${styles.base} ${styles.active}`}`.

## Example

### Component Structure
```
src/components/products/
├── ProductCard.astro
└── styles/
    └── ProductCard.module.css
```

### `ProductCard.astro`
```astro
---
import styles from './styles/ProductCard.module.css';
---
<article class={styles.card}>
  <h3 class={styles.title}>Product Title</h3>
</article>
```
