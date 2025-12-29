import { createFileRoute } from "@tanstack/react-router";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useChartAccounts } from "@/hooks/use-chart-accounts";
import { Route as RootRoute } from "@/routes/__root";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { planId } = RootRoute.useSearch();
  const numberOfMonthsInSimulation = 30 * 12;
  const chartAccounts = useChartAccounts({
    monthsToSimulate: numberOfMonthsInSimulation,
    planId,
  });

  // Transform chart data to the format recharts expects
  const chartData =
    chartAccounts?.data
      // take only the first month of each year
      .filter((point) => point.date.getMonth() === 0)
      .map((point) => ({
        date: point.dateLabel,
        ...point.balances,
      })) ?? [];

  // Create chart config with colors for each account
  const chartConfig =
    chartAccounts?.accounts.reduce(
      (config, account, index) => {
        const colors = [
          "var(--chart-1)",
          "var(--chart-2)",
          "var(--chart-3)",
          "var(--chart-4)",
          "var(--chart-5)",
        ];
        config[account.id] = {
          label: account.name,
          color: colors[index % colors.length] ?? "var(--chart-1)",
        };
        return config;
      },
      {} as Record<string, { label: string; color: string }>,
    ) ?? {};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-foreground">Finance Planner</h1>
      <p className="text-muted-foreground mt-2">
        Welcome to your personal finance planning application!
      </p>

      {chartAccounts ? (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Balances Over Time (30 Years)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatCurrency}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {chartAccounts.accounts.map((account, index) => {
                    const isLast = chartAccounts.accounts.length === index + 1;
                    const isTotal = account.id === "total-assets";
                    if (isTotal) {
                      return <Line dataKey={account.id} stroke="transparent" dot={false} />;
                    }

                    return (
                      <Bar
                        key={account.id}
                        stackId="a"
                        dataKey={account.id}
                        fill={chartConfig[account.id]?.color}
                        radius={isLast ? [4, 4, 0, 0] : undefined}
                      />
                    );
                  })}
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2 text-foreground">No accounts yet</p>
              <p className="text-sm text-muted-foreground">
                Add accounts to see your financial simulation
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
