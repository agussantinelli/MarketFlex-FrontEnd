---
name: global-skills
description: Catalog of all specialized skills used across the MarketFlex project (Frontend & Backend).
---

# 📚 MarketFlex Global Skills Catalog

This skill serves as a central index for all architectural and development guidelines established in the MarketFlex project. Each skill defines rules and best practices that **MUST** be respected by the agent and developers.

## 🏎️ Frontend Skills (`MarketFlex-FrontEnd`)

- **[astro](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/astro/SKILL.md)**: Guidelines for Astro development, islands architecture, and performance.
- **[astro-scripts](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/astro-scripts/SKILL.md)**: JS/TS management in Astro components.
- **[css-modules](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/css-modules/SKILL.md)**: rules for extracting CSS to `.module.css` files.
- **[modular-architecture](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/modular-architecture/SKILL.md)**: Maintaining the modular structure of the frontend.
- **[performance](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/performance/SKILL.md)**: Optimization strategies and Core Web Vitals.
- **[responsive-design](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-FrontEnd/.agent/skills/responsive-design/SKILL.md)**: Mobile-first and fluid layout best practices.

## ⚙️ Backend Skills (`MarketFlex-BackEnd`)

- **[global-context](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/global-context/SKILL.md)**: The "Master Rule". Enforces compliance with all other skills.
- **[clean-structure](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/clean-structure/SKILL.md)**: Feature-based architecture and folder organization.
- **[code-quality](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/code-quality/SKILL.md)**: SOLID principles, naming, and "No Comments" policy.
- **[naming-conventions](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/naming-conventions/SKILL.md)**: Filename suffixes and database naming rules.
- **[swagger-openapi](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/swagger-openapi/SKILL.md)**: Mandatory API documentation with Zero-Pollution pattern.
- **[express](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/express/SKILL.md)**: Hono/Express routing and middleware best practices.
- **[node](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/node/SKILL.md)**: Node.js runtime configuration and best practices.
- **[test](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/test/SKILL.md)**: Testing guidelines for the backend.
- **[skill-generator](file:///c:/Users/Agus/Documents/MarketFlex/MarketFlex-BackEnd/.agent/skills/skill-generator/SKILL.md)**: Standardized way to create new skills like this one.

## 🛠️ Usage guidelines

1. **Check before coding**: Always consult the relevant skill(s) before implementing a new feature.
2. **Consistency over speed**: If a skill defines a pattern, follow it strictly.
3. **Skill updates**: When a new architectural pattern is established, update the relevant skill or create a new one using the `skill-generator`.
