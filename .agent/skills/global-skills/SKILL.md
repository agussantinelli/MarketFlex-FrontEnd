---
name: global-skills
description: Catalog of all specialized skills used across the MarketFlex project (Frontend & Backend).
---

# 📚 MarketFlex Global Skills Catalog

This skill serves as a central index for all architectural and development guidelines established in the MarketFlex project. Each skill defines rules and best practices that **MUST** be respected by the agent and developers.

## 🏎️ Frontend Skills (`MarketFlex-FrontEnd`)

- **[astro](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/astro/SKILL.md)**: Guidelines for Astro development, islands architecture, and performance.
- **[astro-scripts](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/astro-scripts/SKILL.md)**: JS/TS management in Astro components.
- **[clean-structure](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/clean-structure/SKILL.md)**: Component organization and atomic design principles for the FrontEnd.
- **[code-quality](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/code-quality/SKILL.md)**: Guidelines for clean code, readability, and the "No Comments" policy.
- **[css-modules](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/css-modules/SKILL.md)**: rules for extracting CSS to `.module.css` files.
- **[modular-architecture](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/modular-architecture/SKILL.md)**: Maintaining the modular structure of the frontend.
- **[performance](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/performance/SKILL.md)**: Optimization strategies and Core Web Vitals.
- **[readme-auto-sync](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/readme-auto-sync/SKILL.md)**: Mandatory automated README syncing for project structure and tests.
- **[responsive-design](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/responsive-design/SKILL.md)**: Mobile-first and fluid layout best practices.
- **[sileo-notifications](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/sileo-notifications/SKILL.md)**: Mandatory rules for visual notifications using Sileo.
- **[skill-generator](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/skill-generator/SKILL.md)**: A tool for creating new skills following the MarketFlex standard.
- **[test](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/test/SKILL.md)**: Guidelines and E2E testing.
- **[test-enforcement](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/test-enforcement/SKILL.md)**: Mandatory rule requiring one test per file.

## ⚙️ Backend Skills (`MarketFlex-BackEnd`)

- **[backend-testing](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/backend-testing/SKILL.md)**: Standardized testing stack using Vitest, MSW, and Faker.
- **[clean-structure](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/clean-structure/SKILL.md)**: Feature-based architecture and folder organization.
- **[code-quality](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/code-quality/SKILL.md)**: SOLID principles, naming, and "No Comments" policy.
- **[express](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/express/SKILL.md)**: Hono/Express routing and middleware best practices.
- **[global-context](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/global-context/SKILL.md)**: The "Master Rule". Enforces compliance with all other skills.
- **[naming-conventions](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/naming-conventions/SKILL.md)**: Filename suffixes and database naming rules.
- **[no-browser](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/no-browser/SKILL.md)**: Regla de oro que prohíbe terminantemente el uso del subagente del navegador (browser subagent).
- **[node](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/node/SKILL.md)**: Node.js runtime configuration and best practices.
- **[readme-auto-sync](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/readme-auto-sync/SKILL.md)**: Mandatory automated README syncing for project structure and tests.
- **[skill-generator](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/skill-generator/SKILL.md)**: Standardized way to create new skills like this one.
- **[swagger-openapi](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/swagger-openapi/SKILL.md)**: Mandatory API documentation with Zero-Pollution pattern.
- **[test](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/test/SKILL.md)**: Testing guidelines for the backend.
- **[test-enforcement](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/test-enforcement/SKILL.md)**: Mandatory rule requiring one test per file.

## 🛠️ Usage guidelines

1. **Check before coding**: Always consult the relevant skill(s) before implementing a new feature.
2. **Consistency over speed**: If a skill defines a pattern, follow it strictly.
3. **Skill updates**: When a new architectural pattern is established, update the relevant skill or create a new one using the `skill-generator`.
