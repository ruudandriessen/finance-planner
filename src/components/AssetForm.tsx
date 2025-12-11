import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface AssetFormData {
	name: string;
	amount: string;
}

interface AssetFormProps {
	initialData?: AssetFormData;
	onSubmit: (data: AssetFormData) => void | Promise<void>;
	onCancel: () => void;
	onDelete?: () => void | Promise<void>;
	submitLabel?: string;
}

export function AssetForm({
	initialData = { name: "", amount: "" },
	onSubmit,
	onCancel,
	onDelete,
	submitLabel = "Save",
}: AssetFormProps) {
	const [formData, setFormData] = useState<AssetFormData>(initialData);

	const handleInputChange = (field: keyof AssetFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const amount = parseFloat(formData.amount);
		if (Number.isNaN(amount)) return;

		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<Label htmlFor="name">Asset Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => handleInputChange("name", e.target.value)}
					placeholder="Enter asset name"
					className="mt-2"
					required
				/>
			</div>

			<div>
				<Label htmlFor="amount">Amount ($)</Label>
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
				{onDelete && (
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
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
