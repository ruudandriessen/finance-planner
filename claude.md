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
