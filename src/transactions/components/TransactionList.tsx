import type { Transaction } from "@/transactions/collection";

type TransactionListProps = {
  transactions: Transaction[];
};

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString();
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Description</th>
            <th className="p-3 text-left font-medium">Counterparty</th>
            <th className="p-3 text-left font-medium">Account</th>
            <th className="p-3 text-right font-medium">Amount</th>
            <th className="p-3 text-right font-medium">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b hover:bg-muted/50">
              <td className="p-3">{formatDate(t.date)}</td>
              <td className="p-3 max-w-xs truncate" title={t.description}>
                {t.description}
              </td>
              <td className="p-3">{t.counterpartyName ?? "-"}</td>
              <td className="p-3">
                <code className="text-xs">{t.iban}</code>
              </td>
              <td
                className={`p-3 text-right font-mono ${t.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {t.amount >= 0 ? "+" : ""}
                {t.amount.toFixed(2)}
              </td>
              <td className="p-3 text-right font-mono">{t.balanceAfter?.toFixed(2) ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
