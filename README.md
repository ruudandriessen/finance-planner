# Finance Planner

A client-side financial planning application that simulates financial flows over time.

## Quick Start

```bash
bun install
bun run dev
```

## Architecture

### User Interface

The app uses a unified Financial Items page at `/financial-items` that consolidates all financial item types into grouped category sections:

- **Accounts** - Savings and Checking accounts
- **Income** - Recurring income sources
- **Expenses** - Recurring expenses
- **Mortgages** - Loan and mortgage information

Each category displays items as cards with inline edit capabilities. Adding/editing items opens a Sheet panel from the right side, keeping context visible.

### Key Components

- `src/routes/financial-items/index.tsx` - Unified financial items page
- `src/components/financial-items/CategorySection.tsx` - Reusable category section with gradient header
- `src/components/financial-items/FinancialItemCard.tsx` - Card display for any financial item type
- `src/components/financial-items/FinancialItemSheet.tsx` - Sheet wrapper for add/edit forms

### Simulation

The Dashboard (`/`) displays a 30-year simulation chart showing account balances over time. Financial items are converted to internal accounts and flows for simulation.

### Data Storage

Uses TanStack React DB with localStorage persistence. All financial items are stored in the `financialItemsCollection`.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router (file-based)
- **State**: TanStack React DB (localStorage)
- **Styling**: Tailwind CSS v4 with Radix UI
- **Build**: Vite
