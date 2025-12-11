import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRightLeft, Edit3, Plus } from "lucide-react";
import { accountsCollection } from "../../collections/accounts";
import { flowsCollection } from "../../collections/flows";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/flows/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: flows } = useLiveQuery(flowsCollection);
	const { data: accounts } = useLiveQuery(accountsCollection);
	const navigate = useNavigate();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const getAccountName = (accountId: string) => {
		return accounts?.find((a) => a.id === accountId)?.name || "Unknown";
	};

	const getFlowAmount = (
		flow: typeof flows extends (infer T)[] ? T : never,
	) => {
		if (flow.strategy.type === "fixed") {
			return flow.strategy.config.amount;
		} else if (flow.strategy.type === "mortgage") {
			return flow.strategy.config.totalPaymentAmount;
		}
		return 0;
	};

	const sortedFlows = flows?.sort((a, b) => a.priorityOrder - b.priorityOrder);

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Flows</h1>
					<p className="text-muted-foreground mt-1">
						Manage recurring financial flows between accounts
					</p>
				</div>
				<Button onClick={() => navigate({ to: "/flows/add" })}>
					<Plus className="h-4 w-4 mr-2" />
					Add Flow
				</Button>
			</div>

			{sortedFlows && sortedFlows.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{sortedFlows.map((flow) => (
						<Card key={flow.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle className="flex items-center gap-2 text-base">
									<ArrowRightLeft className="h-4 w-4 text-blue-600" />
									{flow.name}
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										navigate({
											to: "/flows/$flowId/edit",
											params: { flowId: flow.id },
										})
									}
								>
									<Edit3 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-2xl font-bold">
									{flow.strategy.type === "fixed" ||
									flow.strategy.type === "mortgage"
										? formatCurrency(getFlowAmount(flow))
										: `${flow.strategy.config.growthRate * 100}%`}
								</div>

								<div className="text-sm text-muted-foreground space-y-1">
									<div className="flex items-center gap-1">
										<span className="font-medium">From:</span>
										<span>{getAccountName(flow.sourceAccountId)}</span>
									</div>
									<div className="flex items-center gap-1">
										<span className="font-medium">To:</span>
										<span>{getAccountName(flow.targetAccountId)}</span>
									</div>
								</div>

								<div className="flex items-center gap-2 flex-wrap">
									<Badge variant="outline">{flow.schedule}</Badge>
									<Badge variant="secondary">{flow.strategy.type}</Badge>
									<Badge variant="outline" className="text-xs">
										Priority {flow.priorityOrder}
									</Badge>
								</div>

								{flow.modifiers.length > 0 && (
									<div className="flex items-center gap-1 flex-wrap">
										{flow.modifiers.map((modifier) => (
											<Badge
												key={modifier}
												variant="default"
												className="text-xs"
											>
												{modifier}
											</Badge>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 px-6">
						<div className="text-muted-foreground text-center">
							<p className="text-lg font-medium mb-2">No flows yet</p>
							<p className="text-sm text-muted-foreground">
								Add your first flow to get started with automated financial
								planning
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
