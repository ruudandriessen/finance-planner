import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { accountsCollection } from "../../collections/accounts";
import { AssetForm, type AssetFormData } from "../../components/AssetForm";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";

export const Route = createFileRoute("/accounts/add")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleSubmit = async (data: AssetFormData) => {
		const amount = parseFloat(data.amount);
		if (Number.isNaN(amount)) return;

		await accountsCollection.insert({
			id: crypto.randomUUID(),
			name: data.name,
			amount,
			type: data.type,
		});
		navigate({ to: "/accounts" });
	};

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<div className="mb-6">
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/accounts" })}
					className="mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Accounts
				</Button>
				<h1 className="text-3xl font-bold text-foreground">Add New Account</h1>
				<p className="text-muted-foreground mt-1">
					Add a new account to your portfolio
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-foreground">
						Account Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AssetForm
						onSubmit={handleSubmit}
						onCancel={() => navigate({ to: "/accounts" })}
						submitLabel="Add Account"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
