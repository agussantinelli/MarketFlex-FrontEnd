---
name: astro
description: Guidelines for Astro development, islands architecture, and performance.
---

# Astro Skill

## Context
Astro is our frontend framework. Leveraging its "Zero-JS by default" philosophy is key.

## Guidelines
1. **Islands Architecture**: Only hydrate components that require interactivity using `client:*` directives.
2. **Components**: Use `.astro` components for static HTML and only use Framework components (React, Svelte, etc.) when necessary.
3. **Data Fetching**: Use top-level `await` in Astro component scripts for build-time data fetching.
4. **Style**: Prefer scoped `<style>` tags within `.astro` components.
5. **Assets**: Use the `getImage` and `Picture` components for optimized image handling.
