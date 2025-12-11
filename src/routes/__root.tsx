import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createRootRoute({
	component: () => (
		<ThemeProvider defaultTheme="system">
			<SidebarProvider defaultOpen={false}>
				<AppSidebar />
				<main className="w-full">
					<DynamicBreadcrumb />
					<Outlet />
				</main>
			</SidebarProvider>
		</ThemeProvider>
	),
});
