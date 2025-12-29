# Finance Planner - Agent Guide

> **IMPORTANT FOR AI AGENTS**: When making architectural changes, additions, or significant modifications to this project, you MUST update the `README.md` file to reflect those changes.

## Project Overview

Finance Planner is a client-side financial planning application that simulates financial flows over time. Users create "finance items" (a simplified interface), which are then derived into accounts and flows for simulation.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 with TypeScript, with the compiler enabled
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack React DB (localStorage-based collections)
- **Styling**: Tailwind CSS v4 with Radix UI components
- **Build Tool**: Vite
- **Linting/Formatting**: Biome

## Architecture

### User-Facing: Financial Items

Users interact with **Financial Items** - a simplified abstraction over accounts and flows. Each financial item represents a real-world financial concept:

- **Savings**: A savings account with initial balance and optional annual interest rate (paid out in January based on weighted average balance)
- **Checking**: A checking account with initial balance
- **Income**: Regular income deposited to a target account
- **Expense**: Regular expense paid from a source account
- **Mortgage**: Loan with payment amount, interest rate, and loan amount

Financial items are stored in `financialItemsCollection` and edited via dedicated form components.

### Internal: Accounts and Flows (Simulation Only)

**Accounts** and **Flows** exist purely as internal simulation concepts. They are **not** stored or edited directly by users. Instead, they are **derived** from financial items at simulation time.

The derivation happens in `src/simulator/derivers/derive-accounts-flows.ts`:
1. Each financial item type has a corresponding derive function (e.g., `deriveSavings`, `deriveIncome`)
2. These functions convert user-friendly financial items into simulation-ready accounts and flows
3. The `deriveAccountsAndFlows` function aggregates all derived accounts and flows

### Simulation Engine

The simulation engine (`src/simulator/run.ts`) operates on derived accounts and flows:

1. **Input**: Takes derived accounts and flows from `deriveAccountsAndFlows()`
2. **Initialization**: Creates balance map from derived accounts
3. **Time Loop**: Iterates month-by-month
4. **Rule Execution**: Processes flows in priority order (waterfall effect)
5. **Strategy Execution**: Each flow's strategy generates transactions
6. **State Updates**: Transactions immediately update balances
7. **History Recording**: Snapshot of balances and transactions per month

**Key Characteristics**:
- Waterfall execution: earlier flows affect later flows in the same month
- Priority-based ordering: lower `priorityOrder` runs first
- Date-based filtering: flows respect `start`/`end` dates

### Account Types (Internal)

- **Asset**: Positive balances (checking, savings)
- **Liability**: Negative balances (mortgages, loans)
- **Income**: Income sources
- **Expense**: Expense categories

**Important**: Liabilities are stored as negative numbers. Paying off debt means moving positive cash to a negative liability.

### Flow Strategies (Internal)

Flows use a discriminated union strategy pattern:

1. **Fixed** (`type: "fixed"`): Simple fixed-amount transfer
2. **Mortgage** (`type: "mortgage"`): Calculates interest and principal payments
3. **Compound** (`type: "compound"`): Applies percentage growth to target account balance
4. **SavingsInterest** (`type: "savingsInterest"`): Tracks monthly balance and pays out annual interest in January based on weighted average balance

## Data Flow Summary

```
User creates/edits Financial Items
         ↓
Stored in financialItemsCollection (localStorage)
         ↓
useSimulation() reads financial items
         ↓
deriveAccountsAndFlows() converts to accounts + flows
         ↓
runSimulation() executes simulation
         ↓
Results displayed to user
```

## Key Files

- `src/financial-items/collection.ts`: User-facing financial items schema and collection
- `src/flows/flows.ts`: Internal flow schema (used by derivation)
- `src/simulator/derivers/derive-accounts-flows.ts`: Converts financial items to accounts/flows
- `src/hooks/use-simulation.ts`: Hook that orchestrates derivation and simulation
- `src/simulator/run.ts`: Core simulation logic
- `src/simulator/strategies.ts`: Strategy implementations
- `src/financial-items/components/*.tsx`: Form components for editing financial items

## Routing

Uses TanStack Router with file-based routing:
- Routes defined in `src/routes/`
- File names map to URL paths
- Dynamic routes use `$` prefix
- Root route (`__root.tsx`) provides layout with sidebar

---

# Best Practices

## Nullish Coalescing

Use `??` instead of `||`. The nullish coalescing operator only falls back for `null`/`undefined`, preserving falsy values like `0`, `""`, and `false`.

## Type Safety

Never use type casts (`as` or angle brackets). Fix the underlying type issue instead.

## UI Components

Use shadcn components. Add new ones as needed rather than building custom alternatives.

## React

No `useCallback` or `useMemo` — the React compiler handles memoization.

## Eliminate Optional State Early

Assign defaults at the earliest opportunity to avoid propagating `undefined` through your code.

**Destructuring:**

```typescript
// Bad
const { data } = property;
const items = data?.filter(fn) ?? [];

// Good
const { data = [] } = property;
const items = data.filter(fn);
```

**Function arguments:**

```typescript
// Bad
function process(items?: string[]) {
  const list = items ?? [];
  return list.map(fn);
}

// Good
function process(items: string[] = []) {
  return items.map(fn);
}
```

**Variable assignment:**

```typescript
// Bad
doSomething(value ?? default, value ?? default);

// Good
const safeValue = value ?? default;
doSomething(safeValue, safeValue);
```

## Control Flow

Early returns only. Never use `else`:

```typescript
// Bad
if (value) {
  return process(value);
} else {
  return null;
}

// Good
if (!value) {
  return null;
}
return process(value);
```

## Paradigm

Functional approach only. No classes.
