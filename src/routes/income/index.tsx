import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DollarSign, Edit3, Plus } from "lucide-react";
import { incomeCollection } from "../../collections/income";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/income/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: income } = useLiveQuery(incomeCollection);
	const navigate = useNavigate();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const calculateTotalMonthlyIncome = () => {
		if (!income) return 0;
		return income.reduce((sum: number, incomeItem) => {
			return sum + incomeItem.amount;
		}, 0);
	};

	const totalMonthlyIncome = calculateTotalMonthlyIncome();
	const totalAnnualIncome = totalMonthlyIncome * 12;

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Income</h1>
					<p className="text-muted-foreground">
						Monthly: {formatCurrency(totalMonthlyIncome)} • Annual:{" "}
						{formatCurrency(totalAnnualIncome)}
					</p>
				</div>

				<Button onClick={() => navigate({ to: "/income/add" })}>
					<Plus className="h-4 w-4" />
					Add Income
				</Button>
			</div>

			{income && income.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{income.map((incomeItem) => (
						<Card key={incomeItem.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-4 w-4 text-green-600" />
									{incomeItem.name}
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										navigate({
											to: "/income/$incomeId/edit",
											params: { incomeId: incomeItem.id },
										})
									}
								>
									<Edit3 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatCurrency(incomeItem.amount)}
								</div>
								<p className="text-xs text-muted-foreground">{incomeItem.period}</p>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 px-6">
						<div className="text-muted-foreground text-center">
							<p className="text-lg font-medium mb-2">No income sources yet</p>
							<p className="text-sm text-muted-foreground">
								Add your first income source to get started
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
