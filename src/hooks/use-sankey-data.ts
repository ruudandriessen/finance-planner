import { useLiveQuery } from "@tanstack/react-db";
import { financialItemsCollection } from "@/collections/financialItems";
import type { FinancialItemBase } from "@/components/financial-items/types";

export type SankeyNode = {
  name: string;
  displayName?: string;
};

export type SankeyLink = {
  source: number;
  target: number;
  value: number;
};

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

/**
 * Builds Sankey diagram data from financial items.
 * Virtual nodes (Income, Expenses) are used as intermediaries without visible labels.
 * Only user-created financial items get visible labels.
 */
export function useSankeyData(): SankeyData | null {
  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);

  if (financialItems.length === 0) {
    return null;
  }

  return buildSankeyData(financialItems);
}

function buildSankeyData(items: FinancialItemBase[]): SankeyData | null {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeIndexMap = new Map<string, number>();

  const getOrCreateNode = (id: string, displayName?: string): number => {
    const existing = nodeIndexMap.get(id);
    if (existing !== undefined) {
      return existing;
    }
    const index = nodes.length;
    nodes.push({ name: id, displayName });
    nodeIndexMap.set(id, index);
    return index;
  };

  // Collect accounts (savings/checking) for lookups
  const accountItems = items.filter(
    (item) => item.data.type === "savings" || item.data.type === "checking",
  );
  const accountIdToName = new Map<string, string>();
  for (const item of accountItems) {
    accountIdToName.set(item.id, item.name);
  }

  // Process income items
  const incomeItems = items.filter((item) => item.data.type === "income");
  for (const item of incomeItems) {
    if (item.data.type !== "income") continue;

    const incomeNodeIndex = getOrCreateNode(item.id, item.name);
    const targetAccountName = accountIdToName.get(item.data.targetAccountId);
    if (!targetAccountName) continue;

    const targetNodeIndex = getOrCreateNode(
      item.data.targetAccountId,
      targetAccountName,
    );

    links.push({
      source: incomeNodeIndex,
      target: targetNodeIndex,
      value: item.data.amount,
    });
  }

  // Process expense items
  const expenseItems = items.filter((item) => item.data.type === "expense");
  for (const item of expenseItems) {
    if (item.data.type !== "expense") continue;

    const sourceAccountName = accountIdToName.get(item.data.sourceAccountId);
    if (!sourceAccountName) continue;

    const sourceNodeIndex = getOrCreateNode(
      item.data.sourceAccountId,
      sourceAccountName,
    );
    const expenseNodeIndex = getOrCreateNode(item.id, item.name);

    links.push({
      source: sourceNodeIndex,
      target: expenseNodeIndex,
      value: item.data.amount,
    });
  }

  // Process mortgage items
  const mortgageItems = items.filter((item) => item.data.type === "mortgage");
  for (const item of mortgageItems) {
    if (item.data.type !== "mortgage") continue;

    const sourceAccountName = accountIdToName.get(
      item.data.paymentSourceAccountId,
    );
    if (!sourceAccountName) continue;

    const sourceNodeIndex = getOrCreateNode(
      item.data.paymentSourceAccountId,
      sourceAccountName,
    );
    const mortgageNodeIndex = getOrCreateNode(item.id, item.name);

    links.push({
      source: sourceNodeIndex,
      target: mortgageNodeIndex,
      value: item.data.paymentAmount,
    });
  }

  if (links.length === 0) {
    return null;
  }

  return { nodes, links };
}
