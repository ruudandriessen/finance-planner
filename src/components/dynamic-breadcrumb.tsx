import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PlanSelector } from "./plan-selector";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";

interface BreadcrumbSegment {
  title: string;
  path: string;
}

export function DynamicBreadcrumb({ planId }: { planId?: string }) {
  const matches = useMatches();

  // Generate breadcrumb segments from route matches
  const breadcrumbs: BreadcrumbSegment[] = matches
    .filter((match) => match.pathname !== "/")
    .map((match) => {
      const pathSegments = match.pathname.split("/").filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (!lastSegment) throw new Error("Last segment is required");

      // Format the title - capitalize and handle special cases
      let title = lastSegment;

      // Handle edit routes
      if (lastSegment === "edit") {
        title = "Edit";
      }
      // Handle add routes
      else if (lastSegment === "add") {
        title = "Add";
      }
      // Handle dynamic parameters (IDs)
      else if (match.params && Object.keys(match.params).length > 0) {
        // If it's a dynamic parameter, use a generic label
        const paramKey = Object.keys(match.params)[0];
        if (lastSegment === match.params[paramKey as keyof typeof match.params]) {
          // Get the parent segment for context
          const parentSegment = pathSegments[pathSegments.length - 2];
          title = parentSegment
            ? `${capitalize(parentSegment.replace(/s$/, ""))} Details`
            : "Details";
        } else {
          title = capitalize(lastSegment);
        }
      }
      // Normal routes
      else {
        title = capitalize(lastSegment);
      }

      return {
        title,
        path: match.pathname,
      };
    });

  // Remove duplicate consecutive segments
  const uniqueBreadcrumbs = breadcrumbs.filter(
    (crumb, index, arr) =>
      index === 0 || crumb.path !== arr[index - 1]?.path || crumb.title !== arr[index - 1]?.title,
  );

  return (
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {uniqueBreadcrumbs.map((crumb, index) => {
              const isLast = index === uniqueBreadcrumbs.length - 1;

              return (
                <div key={crumb.path} className="flex items-center gap-2">
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path}>{crumb.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <PlanSelector planId={planId} />
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
