import { useState } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { financialItemsCollection } from "@/financial-items/collection";
import { transactionsCollection, type Transaction } from "@/transactions/collection";
import { parseRabobankCSV, type ParsedTransaction } from "@/transactions/parsers/rabobank-parser";

type ImportState = "idle" | "preview" | "importing" | "done";

export function TransactionImportForm({ onComplete }: { onComplete: () => void }) {
  const [importState, setImportState] = useState<ImportState>("idle");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string>("");

  const { data: financialItems = [] } = useLiveQuery(financialItemsCollection);

  const accountsWithIban = financialItems.filter(
    (item) => (item.data.type === "savings" || item.data.type === "checking") && item.data.iban,
  );

  const ibanToAccount = new Map(
    accountsWithIban.map((item) => {
      const iban =
        item.data.type === "savings" || item.data.type === "checking" ? item.data.iban : undefined;
      return [iban, item.name];
    }),
  );

  const uniqueIbans = [...new Set(parsedTransactions.map((t) => t.iban))];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");

    const text = await file.text();
    const transactions = parseRabobankCSV(text);

    if (transactions.length === 0) {
      setError("No transactions found in file. Please check the CSV format.");
      return;
    }

    setParsedTransactions(transactions);
    setImportState("preview");
  };

  const handleImport = () => {
    setImportState("importing");

    const now = new Date();

    for (const parsed of parsedTransactions) {
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        iban: parsed.iban,
        date: parsed.date,
        amount: parsed.amount,
        currency: parsed.currency,
        balanceAfter: parsed.balanceAfter,
        counterpartyIban: parsed.counterpartyIban || undefined,
        counterpartyName: parsed.counterpartyName || undefined,
        description: parsed.description,
        transactionCode: parsed.transactionCode || undefined,
        importedAt: now,
      };

      transactionsCollection.insert(transaction);
    }

    setImportState("done");
  };

  if (importState === "done") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Import Complete</h3>
              <p className="text-muted-foreground">
                Successfully imported {parsedTransactions.length} transactions
              </p>
            </div>
            <Button onClick={onComplete}>View Transactions</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (importState === "preview" || importState === "importing") {
    const isImporting = importState === "importing";
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Matching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {uniqueIbans.map((iban) => {
                const matchedAccount = ibanToAccount.get(iban);
                return (
                  <div
                    key={iban}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <code className="text-sm">{iban}</code>
                    {matchedAccount ? (
                      <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        {matchedAccount}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        No matching account
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview ({parsedTransactions.length} transactions)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Counterparty</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.slice(0, 10).map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{t.date.toLocaleDateString()}</td>
                      <td className="p-2 max-w-xs truncate">{t.description}</td>
                      <td className="p-2">{t.counterpartyName}</td>
                      <td
                        className={`p-2 text-right ${t.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {t.amount.toFixed(2)} {t.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTransactions.length > 10 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  ...and {parsedTransactions.length - 10} more transactions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setImportState("idle");
              setParsedTransactions([]);
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Transactions"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
      </CardHeader>
      <CardContent>
        <label className="flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Click to select a file</p>
            <p className="text-sm text-muted-foreground">Rabobank CSV format supported</p>
          </div>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </CardContent>
    </Card>
  );
}
