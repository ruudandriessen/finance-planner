import { useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { Check, Pencil, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    if (!selectedPlan) return;
    setEditName(selectedPlan.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName("");
  };

  const saveEdit = async () => {
    if (!selectedPlan || !editName.trim()) return;
    await plansCollection.update(selectedPlan.id, (plan) => {
      plan.name = editName.trim();
    });
    setIsEditing(false);
    setEditName("");
  };

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
      <div className="flex items-center gap-1">
        {isEditing && selectedPlan ? (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveEdit();
                }
                if (e.key === "Escape") {
                  cancelEditing();
                }
              }}
              className="h-8 w-40"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={saveEdit}
              disabled={!editName.trim()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={cancelEditing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
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
            {selectedPlan && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={startEditing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

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
