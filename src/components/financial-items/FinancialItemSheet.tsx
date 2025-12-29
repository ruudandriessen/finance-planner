import { useLiveQuery } from "@tanstack/react-db";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { financialItemsCollection } from "@/financial-items/collection";
import { AccountForm } from "@/financial-items/components/AccountForm";
import { ExpenseForm } from "@/financial-items/components/ExpenseForm";
import { IncomeForm } from "@/financial-items/components/IncomeForm";
import { MortgageForm } from "@/financial-items/components/MortgageForm";
import type { FinancialItemBase } from "@/financial-items/types";

type ItemType = "account" | "income" | "expense" | "mortgage";

interface FinancialItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  type: ItemType;
  itemId?: string;
}

function getTypeLabel(type: ItemType): string {
  switch (type) {
    case "account":
      return "Account";
    case "income":
      return "Income";
    case "expense":
      return "Expense";
    case "mortgage":
      return "Mortgage";
  }
}

function getTypeDescription(type: ItemType, mode: "add" | "edit"): string {
  const action = mode === "add" ? "Add a new" : "Update your";
  switch (type) {
    case "account":
      return `${action} savings or checking account`;
    case "income":
      return `${action} recurring income source`;
    case "expense":
      return `${action} recurring expense`;
    case "mortgage":
      return `${action} mortgage or loan`;
  }
}

export function FinancialItemSheet({
  open,
  onOpenChange,
  mode,
  type,
  itemId,
}: FinancialItemSheetProps) {
  const { data: items = [] } = useLiveQuery(financialItemsCollection);

  const existingItem = itemId
    ? items.find((item) => item.id === itemId)
    : undefined;

  const handleSubmit = async (data: FinancialItemBase) => {
    if (mode === "add") {
      await financialItemsCollection.insert(data);
    } else if (existingItem) {
      await financialItemsCollection.update(existingItem.id, (old) => {
        old.name = data.name;
        old.priorityOrder = data.priorityOrder;
        old.schedule = data.schedule;
        old.start = data.start;
        old.end = data.end;
        old.data = data.data;
      });
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (existingItem && confirm(`Delete "${existingItem.name}"?`)) {
      await financialItemsCollection.delete(existingItem.id);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title =
    mode === "add" ? `Add ${getTypeLabel(type)}` : `Edit ${getTypeLabel(type)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{getTypeDescription(type, mode)}</SheetDescription>
        </SheetHeader>

        <div className="py-4">{renderForm()}</div>
      </SheetContent>
    </Sheet>
  );

  function renderForm() {
    const submitLabel = mode === "add" ? "Add" : "Save";
    const deleteHandler = mode === "edit" ? handleDelete : undefined;

    switch (type) {
      case "account":
        return (
          <AccountForm
            initialData={existingItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={deleteHandler}
            submitLabel={submitLabel}
          />
        );
      case "income":
        return (
          <IncomeForm
            initialData={existingItem as Parameters<typeof IncomeForm>[0]["initialData"]}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={deleteHandler}
            submitLabel={submitLabel}
          />
        );
      case "expense":
        return (
          <ExpenseForm
            initialData={existingItem as Parameters<typeof ExpenseForm>[0]["initialData"]}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={deleteHandler}
            submitLabel={submitLabel}
          />
        );
      case "mortgage":
        return (
          <MortgageForm
            initialData={existingItem as Parameters<typeof MortgageForm>[0]["initialData"]}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={deleteHandler}
            submitLabel={submitLabel}
          />
        );
    }
  }
}
