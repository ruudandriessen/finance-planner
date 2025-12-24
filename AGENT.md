# Finance Planner - Agent Architecture Guide

> **IMPORTANT FOR AI AGENTS**: When making architectural changes, additions, or significant modifications to this project, you MUST update the `README.md` file to reflect those changes. This ensures the project documentation stays current and helps future agents understand the current state of the codebase.

## Project Overview

Finance Planner is a client-side financial planning application that simulates financial flows over time. It allows users to model accounts, recurring financial flows (income, expenses, transfers), and run simulations to project future financial states.

## Tech Stack

- **Runtime**: Bun (JavaScript runtime)
- **Framework**: React 19 with TypeScript, with the compiler enabled
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack React DB (localStorage-based collections)
- **Styling**: Tailwind CSS v4 with Radix UI components
- **Build Tool**: Vite
- **Linting/Formatting**: Biome

## Core Concepts

### Data Model

The application uses three main collections:

1. **Accounts** (`accountsCollection`)
   - Represents financial accounts (assets, liabilities, income, expenses)
   - Schema: `id`, `name`, `type` (enum), `amount` (number)
   - Stored in localStorage via TanStack React DB

2. **Flows** (`flowsCollection`)
   - Represents recurring financial transactions between accounts
   - Schema includes:
     - `id`, `name`
     - `priorityOrder` (execution order, lower = first)
     - `schedule` (monthly/annually)
     - `sourceAccountId`, `targetAccountId`
     - `start`, `end` (optional date ranges)
     - `strategy` (discriminated union: fixed, mortgage, compound)
     - `modifiers` (e.g., inflation_adjusted)
   - Stored in localStorage via TanStack React DB

3. **Plans** (`plansCollection`)
   - Represents financial scenarios with overrides and one-time events
   - Schema includes:
     - `id`, `name`
     - `globalParams` (e.g., inflationRate)
     - `overrides` (flow patches)
     - `events` (one-time transfers/adjustments)
   - Stored in localStorage via TanStack React DB

### Account Types

- **Asset**: Positive balances (checking, savings, investments)
- **Liability**: Negative balances (mortgages, loans, credit cards)
- **Income**: Income sources
- **Expense**: Expense categories

**Important**: Liabilities are stored as negative numbers. Paying off debt means moving positive cash to a negative liability (e.g., -300k + 1k = -299k).

### Flow Strategies

Flows use a discriminated union strategy pattern:

1. **Fixed** (`type: "fixed"`)
   - Simple fixed-amount transfer
   - Config: `amount`

2. **Mortgage** (`type: "mortgage"`)
   - Calculates interest and principal payments
   - Config: `liabilityAccountId`, `interestExpenseAccountId`, `assetAccountId`, `totalPaymentAmount`, `interestCalculation`
   - Handles negative amortization edge cases

3. **Compound** (`type: "compound"`)
   - Applies percentage growth to target account balance
   - Config: `growthRate`
   - Used for savings interest, stock growth, etc.

### Simulation Engine

The simulation engine (`src/simulate/run.ts`) executes financial flows over time:

1. **Initialization**: Creates balance map from initial accounts
2. **Time Loop**: Iterates month-by-month
3. **Rule Execution**: Processes flows in priority order (waterfall effect)
4. **Strategy Execution**: Each flow's strategy generates transactions
5. **State Updates**: Transactions immediately update balances
6. **History Recording**: Snapshot of balances and transactions per month

**Key Characteristics**:
- Waterfall execution: earlier flows affect later flows in the same month
- Priority-based ordering: lower `priorityOrder` runs first
- Date-based filtering: flows respect `start`/`end` dates
- Strategy registry pattern: extensible strategy system

### Routing

Uses TanStack Router with file-based routing:

- Routes are defined in `src/routes/` directory
- File names map to URL paths (e.g., `flows/index.tsx` → `/flows`)
- Dynamic routes use `$` prefix (e.g., `$flowId.edit.tsx`)
- Root route (`__root.tsx`) provides layout with sidebar and theme provider
- Search params validated with Zod schemas

### Component Architecture

- **UI Components** (`src/components/ui/`): Reusable, unstyled components (shadcn/ui pattern)
- **Feature Components**: Domain-specific components (e.g., `FlowForm`, `IncomeForm`)
- **Layout Components**: `AppSidebar`, `DynamicBreadcrumb`, `ThemeProvider`
- Uses Radix UI primitives for accessibility

### State Management

- **TanStack React DB**: Collections stored in localStorage
- **React Hooks**: Custom hooks for data access (`useLiveQuery`)
- **No global state library**: Collections provide reactive queries

## Development Patterns

### Adding a New Collection

1. Create schema with Zod in `src/collections/[name].ts`
2. Use `createCollection` with `localStorageCollectionOptions`
3. Export collection for use in components

### Adding a New Flow Strategy

1. Define strategy schema in `src/collections/flows.ts` (add to discriminated union)
2. Implement strategy function in `src/simulate/strategies.ts`
3. Register in `StrategyRegistry`
4. Update flow forms to support new strategy type

### Adding a New Route

1. Create file in `src/routes/` following TanStack Router conventions
2. Use `createFileRoute` to define route
3. Route tree auto-generates via Vite plugin

## Key Files Reference

- `src/main.tsx`: App entry, router setup
- `src/routes/__root.tsx`: Root layout, theme, sidebar
- `src/collections/*.ts`: Data models and collections
- `src/simulate/run.ts`: Core simulation logic
- `src/simulate/strategies.ts`: Strategy implementations
- `vite.config.ts`: Build configuration with path aliases (`@/*` → `src/*`)

## Important Notes for Agents

1. **Always update README.md** when making architectural changes
2. **Follow existing patterns**: Use TanStack React DB for data, Zod for schemas
3. **Type safety**: Strict TypeScript, leverage discriminated unions

## Future Considerations

- Plans collection is defined but not fully integrated into simulation
- Inflation adjustment modifier exists but not implemented
- One-time events in plans not yet executed
- Consider adding export/import functionality
- Consider adding charts/visualizations for simulation results

---

**Last Updated**: [Agents should update this date when making changes]
