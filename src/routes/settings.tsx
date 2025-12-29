import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies, userSettingsCollection, type Currency } from "@/settings/collection";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const currencyLabels: Record<Currency, string> = {
  EUR: "Euro (€)",
  USD: "US Dollar ($)",
  GBP: "British Pound (£)",
  JPY: "Japanese Yen (¥)",
  CHF: "Swiss Franc (CHF)",
  CAD: "Canadian Dollar (C$)",
  AUD: "Australian Dollar (A$)",
};

function Settings() {
  const { data: settings = [] } = useLiveQuery(userSettingsCollection);

  const currentSettings = settings[0] ?? { id: "user-settings" as const, currency: "EUR" as const };

  const handleCurrencyChange = (currency: Currency) => {
    if (settings.length === 0) {
      userSettingsCollection.insert({ id: "user-settings", currency });
      return;
    }
    userSettingsCollection.update("user-settings", (oldSettings) => {
      oldSettings.currency = currency;
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Choose the currency to display throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select
              value={currentSettings.currency}
              onValueChange={(value) => handleCurrencyChange(value as Currency)}
            >
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currencyLabels[currency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
