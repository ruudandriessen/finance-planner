import { useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { plansCollection } from "@/plans/plans";

export function PlanSelector({ planId }: { planId?: string }) {
  const { data: plans } = useLiveQuery(plansCollection);
  const navigate = useNavigate({
    from: "/",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const selectedPlan = plans.find((p) => p.id === planId);

  const setPlanId = (planId?: string) => {
    navigate({ search: (prev) => ({ ...prev, planId }) });
  };
  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;

    const newPlan = {
      id: crypto.randomUUID(),
      name: newPlanName.trim(),
      globalParams: {},
      overrides: [],
      events: [],
    };

    await plansCollection.insert(newPlan);
    setPlanId(newPlan.id);
    setNewPlanName("");
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {selectedPlan ? selectedPlan.name : "Select Plan"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Plans</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {plans.length > 0 ? (
            <>
              <DropdownMenuItem onSelect={() => setPlanId()}>
                <span className={planId == null ? "font-medium" : ""}>
                  Current Reality
                </span>
              </DropdownMenuItem>
              {plans.map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  className={plan.id === planId ? "font-medium" : ""}
                  onSelect={() => setPlanId(plan.id)}
                >
                  {plan.name}
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No plans yet</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Give your plan a name. You can edit accounts and flows within this
              plan without affecting your current data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                placeholder="e.g., Retirement Scenario, Home Purchase"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlan();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={!newPlanName.trim()}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
