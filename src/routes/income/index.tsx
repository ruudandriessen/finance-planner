import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { Plus, DollarSign, Gift, Edit3 } from "lucide-react";
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
					<h1 className="text-3xl font-bold text-gray-900">Income</h1>
					<p className="text-gray-600 mt-1">
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
						<Card
							key={incomeItem.id}
							className="border border-gray-200 rounded-lg shadow-sm"
						>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
								<div className="flex items-center space-x-2">
									<DollarSign className="h-4 w-4 text-green-600" />
									<CardTitle className="text-sm font-medium text-gray-700">
										{incomeItem.name}
									</CardTitle>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										navigate({
											to: "/income/$incomeId/edit",
											params: { incomeId: incomeItem.id },
										})
									}
									className="h-8 w-8 p-0"
								>
									<Edit3 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent className="p-4 pt-0">
								<div className="text-2xl font-bold text-gray-900">
									{formatCurrency(incomeItem.amount)}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									{incomeItem.period}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card className="border border-gray-200 rounded-lg">
					<CardContent className="flex flex-col items-center justify-center py-12 px-6">
						<div className="text-gray-600 text-center">
							<p className="text-lg font-medium mb-2 text-gray-900">
								No income sources yet
							</p>
							<p className="text-sm text-gray-600">
								Add your first income source to get started
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
