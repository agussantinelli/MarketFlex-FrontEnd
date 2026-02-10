---
name: clean-structure
description: Component organization and atomic design principles for the FrontEnd.
---

# Clean Structure (FrontEnd)

## Context
A well-organized frontend is easier to maintain and scale.

## Guidelines
1. **Folders**:
   - `src/components`: UI components (Atoms, Molecules, etc.).
   - `src/layouts`: Page structures.
   - `src/pages`: Astro route definitions.
   - `src/styles`: Global CSS and variables.
   - `src/utils`: Helper functions and shared logic.
2. **Atomic Design**: (Optional but recommended) Organize by Atoms, Molecules, Organisms.
3. **Consistency**: Use a consistent naming convention (e.g., PascalCase for components).
4. **Logic separation**: Keep heavy logic in `src/utils` or `src/services` rather than directly in `.astro` frontmatter when possible.
