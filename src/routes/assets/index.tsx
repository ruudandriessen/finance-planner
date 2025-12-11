import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit3, Plus } from "lucide-react";
import { accountsCollection } from "../../collections/accounts";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/assets/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: assets } = useLiveQuery(accountsCollection);
	const navigate = useNavigate();

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	const totalValue =
		assets?.reduce((sum: number, asset) => sum + asset.amount, 0) || 0;

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Assets</h1>
					<p className="text-muted-foreground">
						Total Value: {formatCurrency(totalValue)}
					</p>
				</div>

				<Button onClick={() => navigate({ to: "/assets/add" })}>
					<Plus className="h-4 w-4" />
					Add Asset
				</Button>
			</div>

			{assets && assets.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{assets.map((asset) => (
						<Card key={asset.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>{asset.name}</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										navigate({
											to: "/assets/$assetId/edit",
											params: { assetId: asset.id },
										})
									}
								>
									<Edit3 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatCurrency(asset.amount)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 px-6">
						<div className="text-muted-foreground text-center">
							<p className="text-lg font-medium mb-2 text-foreground">
								No assets yet
							</p>
							<p className="text-sm text-muted-foreground">
								Add your first asset to get started
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
