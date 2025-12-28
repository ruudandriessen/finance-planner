import { createRootRoute, Outlet } from "@tanstack/react-router";
import z from "zod";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createRootRoute({
  component: () => {
    const { planId } = Route.useSearch();
    return (
      <ThemeProvider defaultTheme="system">
        <SidebarProvider defaultOpen={false}>
          <AppSidebar planId={planId} />
          <main className="w-full">
            <DynamicBreadcrumb planId={planId} />
            <Outlet />
          </main>
        </SidebarProvider>
      </ThemeProvider>
    );
  },
  validateSearch: z.object({
    planId: z.string().optional(),
  }),
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);
        return {
          planId: search.planId,
          ...result,
        };
      },
    ],
  },
});
