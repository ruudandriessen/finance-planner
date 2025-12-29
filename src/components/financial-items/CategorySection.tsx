import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  title: string;
  icon: ReactNode;
  gradientClass: string;
  onAdd: () => void;
  emptyMessage?: string;
  children?: ReactNode;
  isEmpty?: boolean;
}

export function CategorySection({
  title,
  icon,
  gradientClass,
  onAdd,
  emptyMessage = "No items yet",
  children,
  isEmpty = false,
}: CategorySectionProps) {
  return (
    <section className="mb-8">
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-lg mb-4",
          "bg-gradient-to-r",
          gradientClass,
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {isEmpty ? (
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-muted-foreground text-center">
              <p className="text-sm">{emptyMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      )}
    </section>
  );
}
