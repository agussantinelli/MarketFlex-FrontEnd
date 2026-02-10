---
name: performance
description: Core Web Vitals and Astro-specific optimization strategies.
---

# Performance Skill

## Context
Performance is a feature. Fast load times improve SEO and user conversion.

## Guidelines
1. **Zero JS**: Aim for the least amount of JavaScript sent to the client.
2. **LCP**: Optimize images and text above the fold to improve Largest Contentful Paint.
3. **CLS**: Use explicit dimensions for images/videos to avoid layout shifts.
4. **Caching**: Use efficient caching strategies for static assets.
5. **Hydration**: Use `client:visible` or `client:idle` instead of `client:load` for non-critical interactive elements.
