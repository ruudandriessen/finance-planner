import { useLiveQuery } from "@tanstack/react-db";
import { useState } from "react";
import { accountsCollection } from "@/collections/accounts";
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

interface FlowFormData {
	name: string;
	sourceAccountId: string;
	targetAccountId: string;
	schedule: string;
	priorityOrder: number;
	strategyType: "fixed" | "mortgage";
	amount?: number;
	inflationAdjusted: boolean;
	// Mortgage-specific fields
	liabilityAccountId?: string;
	interestExpenseAccountId?: string;
	assetAccountId?: string;
	totalPaymentAmount?: number;
	baseAnnualRate?: number;
}

interface FlowFormProps {
	initialData?: Partial<FlowFormData>;
	onSubmit: (data: FlowFormData) => Promise<void> | void;
	onCancel: () => void;
	onDelete?: () => void;
	submitLabel?: string;
	mode: "add" | "edit";
}

export function FlowForm({
	initialData = {},
	onSubmit,
	onCancel,
	onDelete,
	submitLabel,
	mode,
}: FlowFormProps) {
	const { data: accounts } = useLiveQuery(accountsCollection);
	const [formData, setFormData] = useState<FlowFormData>({
		name: initialData.name || "",
		sourceAccountId: initialData.sourceAccountId || "",
		targetAccountId: initialData.targetAccountId || "",
		schedule: initialData.schedule || "monthly",
		priorityOrder: initialData.priorityOrder ?? 10,
		strategyType: initialData.strategyType || "fixed",
		amount: initialData.amount,
		inflationAdjusted: initialData.inflationAdjusted || false,
		liabilityAccountId: initialData.liabilityAccountId,
		interestExpenseAccountId: initialData.interestExpenseAccountId,
		assetAccountId: initialData.assetAccountId,
		totalPaymentAmount: initialData.totalPaymentAmount,
		baseAnnualRate: initialData.baseAnnualRate,
	});

	const handleInputChange = (
		field: keyof FlowFormData,
		value: string | number | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	const defaultSubmitLabel = mode === "add" ? "Add Flow" : "Update Flow";

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div>
				<Label htmlFor="name">Flow Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => handleInputChange("name", e.target.value)}
					placeholder="e.g., Salary, Rent Payment, Mortgage"
					className="mt-2"
					required
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="priorityOrder">Priority Order</Label>
					<Input
						id="priorityOrder"
						type="number"
						min="1"
						value={formData.priorityOrder}
						onChange={(e) =>
							handleInputChange("priorityOrder", parseInt(e.target.value) || 1)
						}
						className="mt-2"
						required
					/>
					<p className="text-xs text-muted-foreground mt-1">
						Lower numbers run first (1=Income, 10=Bills, etc.)
					</p>
				</div>

				<div>
					<Label htmlFor="schedule">Schedule</Label>
					<Select
						value={formData.schedule}
						onValueChange={(value) => handleInputChange("schedule", value)}
					>
						<SelectTrigger className="mt-2">
							<SelectValue placeholder="Select schedule" />
						</SelectTrigger>
						<SelectContent id="schedule">
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="weekly">Weekly</SelectItem>
							<SelectItem value="biweekly">Bi-weekly</SelectItem>
							<SelectItem value="monthly">Monthly</SelectItem>
							<SelectItem value="quarterly">Quarterly</SelectItem>
							<SelectItem value="annually">Annually</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor="sourceAccount">From (Source Account)</Label>
				<Select
					value={formData.sourceAccountId}
					onValueChange={(value) => handleInputChange("sourceAccountId", value)}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder="Select source account" />
					</SelectTrigger>
					<SelectContent id="sourceAccount">
						{accounts?.map((account) => (
							<SelectItem key={account.id} value={account.id}>
								{account.name} ({account.type})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="targetAccount">To (Target Account)</Label>
				<Select
					value={formData.targetAccountId}
					onValueChange={(value) => handleInputChange("targetAccountId", value)}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder="Select target account" />
					</SelectTrigger>
					<SelectContent id="targetAccount">
						{accounts?.map((account) => (
							<SelectItem key={account.id} value={account.id}>
								{account.name} ({account.type})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor="strategyType">Strategy Type</Label>
				<Select
					value={formData.strategyType}
					onValueChange={(value: "fixed" | "mortgage") =>
						handleInputChange("strategyType", value)
					}
				>
					<SelectTrigger className="mt-2">
						<SelectValue placeholder="Select strategy type" />
					</SelectTrigger>
					<SelectContent id="strategyType">
						<SelectItem value="fixed">Fixed Amount</SelectItem>
						<SelectItem value="mortgage">Mortgage</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-xs text-muted-foreground mt-1">
					Fixed for simple transfers, Mortgage for complex loan calculations
				</p>
			</div>

			{formData.strategyType === "fixed" && (
				<div>
					<Label htmlFor="amount">Amount ($)</Label>
					<Input
						id="amount"
						type="number"
						step="0.01"
						min="0"
						value={formData.amount || ""}
						onChange={(e) =>
							handleInputChange("amount", parseFloat(e.target.value) || 0)
						}
						placeholder="Enter amount"
						className="mt-2"
						required
					/>
					<p className="text-sm text-muted-foreground mt-1">
						Fixed amount per {formData.schedule} period
					</p>
				</div>
			)}

			{formData.strategyType === "mortgage" && (
				<div className="space-y-4 border rounded-lg p-4 bg-muted/30">
					<h3 className="font-semibold text-sm">Mortgage Configuration</h3>

					<div>
						<Label htmlFor="liabilityAccount">Liability Account</Label>
						<Select
							value={formData.liabilityAccountId || ""}
							onValueChange={(value) =>
								handleInputChange("liabilityAccountId", value)
							}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select liability account" />
							</SelectTrigger>
							<SelectContent id="liabilityAccount">
								{accounts
									?.filter((a) => a.type === "liability")
									.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="interestExpenseAccount">
							Interest Expense Account
						</Label>
						<Select
							value={formData.interestExpenseAccountId || ""}
							onValueChange={(value) =>
								handleInputChange("interestExpenseAccountId", value)
							}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select expense account" />
							</SelectTrigger>
							<SelectContent id="interestExpenseAccount">
								{accounts
									?.filter((a) => a.type === "expense")
									.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="assetAccount">Asset Account</Label>
						<Select
							value={formData.assetAccountId || ""}
							onValueChange={(value) =>
								handleInputChange("assetAccountId", value)
							}
						>
							<SelectTrigger className="mt-2">
								<SelectValue placeholder="Select asset account" />
							</SelectTrigger>
							<SelectContent id="assetAccount">
								{accounts
									?.filter((a) => a.type === "asset")
									.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="totalPaymentAmount">Total Payment Amount ($)</Label>
						<Input
							id="totalPaymentAmount"
							type="number"
							step="0.01"
							min="0"
							value={formData.totalPaymentAmount || ""}
							onChange={(e) =>
								handleInputChange(
									"totalPaymentAmount",
									parseFloat(e.target.value) || 0,
								)
							}
							placeholder="Monthly payment amount"
							className="mt-2"
							required
						/>
					</div>

					<div>
						<Label htmlFor="baseAnnualRate">Annual Interest Rate (%)</Label>
						<Input
							id="baseAnnualRate"
							type="number"
							step="0.01"
							min="0"
							max="100"
							value={formData.baseAnnualRate || ""}
							onChange={(e) =>
								handleInputChange(
									"baseAnnualRate",
									parseFloat(e.target.value) || 0,
								)
							}
							placeholder="e.g., 4.5"
							className="mt-2"
							required
						/>
					</div>
				</div>
			)}

			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="inflationAdjusted"
					checked={formData.inflationAdjusted}
					onChange={(e) =>
						handleInputChange("inflationAdjusted", e.target.checked)
					}
					className="h-4 w-4 rounded border-gray-300"
				/>
				<Label htmlFor="inflationAdjusted" className="cursor-pointer">
					Adjust for inflation
				</Label>
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
