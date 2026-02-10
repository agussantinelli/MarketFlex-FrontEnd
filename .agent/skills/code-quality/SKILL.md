---
name: code-quality
description: Guidelines for clean code, readability, and the "No Comments" policy.
---

# Code Quality Skill (FrontEnd)

## Context
Clean code is essential for maintainable UI components.

## Guidelines
1. **NO COMMENTS**: The code should explain itself. Do not comment on what a component or a hook does; use clear names instead.
   - *Example*: Use `isUserLoggedIn` instead of `const logged = true; // checks if user is logged`.
2. **Remove Dead Code**: Never leave commented-out code blocks in components.
3. **Self-Documenting Props**: Use TypeScript interfaces to make component usage clear without extra documentation.
4. **Consistency**: Use the same patterns for state management and data fetching across the app.
