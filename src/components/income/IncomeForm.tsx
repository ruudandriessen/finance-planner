import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { assetsCollection } from "@/collections/assets";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface IncomeFormData {
	name: string;
	amount: string;
	targetAssetId?: string;
	period?: "monthly";
}

interface IncomeFormProps {
	initialData?: Partial<IncomeFormData>;
	onSubmit: (data: IncomeFormData) => Promise<void> | void;
	onCancel: () => void;
	onDelete?: () => void;
	submitLabel?: string;
	mode: "add" | "edit";
}

export function IncomeForm({
	initialData = {},
	onSubmit,
	onCancel,
	onDelete,
	submitLabel,
	mode,
}: IncomeFormProps) {
	const { data: assets } = useLiveQuery(assetsCollection);
	const [formData, setFormData] = useState<IncomeFormData>({
		name: initialData.name || "",
		amount: initialData.amount?.toString() || "",
		targetAssetId: initialData.targetAssetId,
		period: initialData.period || "monthly",
	});

	const handleInputChange = (field: keyof IncomeFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	const defaultSubmitLabel = mode === "add" ? "Add Income" : "Update Income";

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div>
				<Label htmlFor="name">Income Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => handleInputChange("name", e.target.value)}
					placeholder="Enter income source name"
					className="mt-2"
					required
				/>
			</div>

			<div>
				<Label htmlFor="asset">Asset</Label>
				<Select
					value={formData.targetAssetId}
					onValueChange={(value) => handleInputChange("targetAssetId", value)}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder="Select an asset" />
					</SelectTrigger>
					<SelectContent id="asset">
						{assets?.map((asset) => (
							<SelectItem key={asset.id} value={asset.id}>
								{asset.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="amount">Amount ($) - Monthly</Label>
				<Input
					id="amount"
					type="number"
					step="0.01"
					min="0"
					value={formData.amount}
					onChange={(e) => handleInputChange("amount", e.target.value)}
					placeholder="Enter amount"
					className="mt-2"
					required
				/>
				<p className="text-sm text-muted-foreground mt-1">
					Enter your monthly amount you receive
				</p>
			</div>

			<div className="flex gap-4 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					className="flex-1"
				>
					Cancel
				</Button>
				{mode === "edit" && onDelete && (
					<Button
						type="button"
						variant="destructive"
						onClick={onDelete}
						className="flex-1"
					>
						Delete
					</Button>
				)}
				<Button type="submit" className="flex-1">
					{submitLabel || defaultSubmitLabel}
				</Button>
			</div>
		</form>
	);
}
