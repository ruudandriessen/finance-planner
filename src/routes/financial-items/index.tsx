import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Home, Receipt, Wallet } from "lucide-react";
import { useState } from "react";
import { CategorySection } from "@/components/financial-items/CategorySection";
import { FinancialItemCard } from "@/components/financial-items/FinancialItemCard";
import { FinancialItemSheet } from "@/components/financial-items/FinancialItemSheet";
import { financialItemsCollection } from "@/financial-items/collection";

export const Route = createFileRoute("/financial-items/")({
  component: FinancialItemsPage,
});

type ItemType = "account" | "income" | "expense" | "mortgage";

type SheetState = {
  open: boolean;
  mode: "add" | "edit";
  type: ItemType;
  itemId?: string;
};

const categoryGradients = {
  accounts:
    "from-blue-500/10 to-cyan-500/10 dark:from-blue-400/15 dark:to-cyan-400/15",
  income:
    "from-green-500/10 to-emerald-500/10 dark:from-green-400/15 dark:to-emerald-400/15",
  expenses:
    "from-orange-500/10 to-red-500/10 dark:from-orange-400/15 dark:to-red-400/15",
  mortgages:
    "from-purple-500/10 to-violet-500/10 dark:from-purple-400/15 dark:to-violet-400/15",
};

function FinancialItemsPage() {
  const { data: items = [] } = useLiveQuery(financialItemsCollection);

  const [sheetState, setSheetState] = useState<SheetState>({
    open: false,
    mode: "add",
    type: "account",
  });

  const accountItems = items.filter(
    (item) => item.data.type === "savings" || item.data.type === "checking"
  );
  const incomeItems = items.filter((item) => item.data.type === "income");
  const expenseItems = items.filter((item) => item.data.type === "expense");
  const mortgageItems = items.filter((item) => item.data.type === "mortgage");

  const openAddSheet = (type: ItemType) => {
    setSheetState({ open: true, mode: "add", type, itemId: undefined });
  };

  const openEditSheet = (type: ItemType, itemId: string) => {
    setSheetState({ open: true, mode: "edit", type, itemId });
  };

  const closeSheet = () => {
    setSheetState((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Financial Items</h1>
        <p className="text-muted-foreground">
          Manage your accounts, income, expenses, and mortgages
        </p>
      </div>

      <CategorySection
        title="Accounts"
        icon={<Wallet className="h-5 w-5" />}
        gradientClass={categoryGradients.accounts}
        onAdd={() => openAddSheet("account")}
        isEmpty={accountItems.length === 0}
        emptyMessage="Add your savings and checking accounts to get started"
      >
        {accountItems.map((item) => (
          <FinancialItemCard
            key={item.id}
            item={item}
            onEdit={() => openEditSheet("account", item.id)}
          />
        ))}
      </CategorySection>

      <CategorySection
        title="Income"
        icon={<DollarSign className="h-5 w-5" />}
        gradientClass={categoryGradients.income}
        onAdd={() => openAddSheet("income")}
        isEmpty={incomeItems.length === 0}
        emptyMessage="Add your salary, side income, or other recurring income sources"
      >
        {incomeItems.map((item) => (
          <FinancialItemCard
            key={item.id}
            item={item}
            onEdit={() => openEditSheet("income", item.id)}
          />
        ))}
      </CategorySection>

      <CategorySection
        title="Expenses"
        icon={<Receipt className="h-5 w-5" />}
        gradientClass={categoryGradients.expenses}
        onAdd={() => openAddSheet("expense")}
        isEmpty={expenseItems.length === 0}
        emptyMessage="Add your recurring expenses like rent, utilities, or subscriptions"
      >
        {expenseItems.map((item) => (
          <FinancialItemCard
            key={item.id}
            item={item}
            onEdit={() => openEditSheet("expense", item.id)}
          />
        ))}
      </CategorySection>

      <CategorySection
        title="Mortgages"
        icon={<Home className="h-5 w-5" />}
        gradientClass={categoryGradients.mortgages}
        onAdd={() => openAddSheet("mortgage")}
        isEmpty={mortgageItems.length === 0}
        emptyMessage="Add your mortgage or other loan information"
      >
        {mortgageItems.map((item) => (
          <FinancialItemCard
            key={item.id}
            item={item}
            onEdit={() => openEditSheet("mortgage", item.id)}
          />
        ))}
      </CategorySection>

      <FinancialItemSheet
        open={sheetState.open}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
        mode={sheetState.mode}
        type={sheetState.type}
        itemId={sheetState.itemId}
      />
    </div>
  );
}
