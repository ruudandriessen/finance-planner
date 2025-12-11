import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { accountsCollection } from "@/collections/accounts";
import { ExampleChart } from "@/components/example-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useSimulation } from "@/hooks/use-simulation";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { data: accounts } = useLiveQuery(accountsCollection);
	const simulationResults = useSimulation(30 * 12); // 30 years in months

	// Filter to only show assets and liabilities
	const relevantAccounts = accounts?.filter(
		(account) => account.type === "asset" || account.type === "liability",
	);

	// Prepare chart data
	const chartData =
		simulationResults?.map((result) => ({
			date: result.date.toLocaleDateString("en-US", {
				month: "short",
				year: "numeric",
			}),
			...result.balances,
		})) || [];

	// Create chart config with colors for each account
	const chartConfig =
		relevantAccounts?.reduce(
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
		) || {};

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

			{simulationResults && accounts && accounts.length > 0 ? (
				<div className="mt-6 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Account Balances Over Time (30 Years)</CardTitle>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig}>
								<LineChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={formatCurrency}
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
									{relevantAccounts?.map((account) => (
										<Line
											key={account.id}
											type="monotone"
											dataKey={account.id}
											stroke={chartConfig[account.id]?.color}
											strokeWidth={2}
											dot={false}
										/>
									))}
								</LineChart>
							</ChartContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Simulation Results (JSON)</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm">
								{JSON.stringify(simulationResults, null, 2)}
							</pre>
						</CardContent>
					</Card>
				</div>
			) : (
				<Card className="mt-6">
					<CardContent className="flex flex-col items-center justify-center py-12 px-6">
						<div className="text-muted-foreground text-center">
							<p className="text-lg font-medium mb-2 text-foreground">
								No accounts or flows yet
							</p>
							<p className="text-sm text-muted-foreground">
								Add accounts and flows to see your financial simulation
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
