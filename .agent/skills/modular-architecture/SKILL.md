---
name: modular-architecture
description: Guidelines for maintaining a modular architecture in MarketFlex Frontend
---
# Modular Architecture Guidelines

This project follows a strict modular architecture to ensure scalability and maintainability.

## Core Rules

1.  **Type Separation**:
    *   **NEVER** define types or interfaces inside service files or components.
    *   **ALWAYS** create a dedicated file in `src/types/` (e.g., `auth.types.ts`, `product.types.ts`).
    *   Use `type` aliases instead of `interface` unless extending is strictly necessary.

2.  **Service Layer**:
    *   Services (`src/services/`) should only contain API calls and data transformation logic.
    *   They must import types from `src/types/`.
    *   They should not contain UI logic or state management.

3.  **Components**:
    *   Components (`src/components/`, `src/pages/`) should focus on UI and interaction.
    *   They should consume services for data fetching and actions.
    *   They should import types from `src/types/`.

4.  **Directory Structure**:
    *   `src/types/`: Centralized type definitions.
    *   `src/services/`: API integration services.
    *   `src/components/`: Reusable UI components.
    *   `src/pages/`: Astro pages and routing.
    *   `src/layouts/`: Shared layouts.

## Example Workflow

When adding a new feature (e.g., "Orders"):
1.  Create `src/types/order.types.ts`.
2.  Create `src/services/order.service.ts` importing those types.
3.  Create components in `src/components/orders/` using the service and types.
