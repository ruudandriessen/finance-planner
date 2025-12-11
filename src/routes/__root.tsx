import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<>
			<ThemeProvider defaultTheme="system">
				<div>
					<nav className="flex gap-1 border-b-1 border-gray-200 px-4 py-2 items-center">
						<Link to="/">Home</Link>
						<Link to="/assets">Assets</Link>
						<Link to="/income">Income</Link>
						<div style={{ flex: 1 }} />
						<ModeToggle />
					</nav>
				</div>
				<div style={{ padding: "1rem" }}>
					<Outlet />
				</div>
			</ThemeProvider>
		</>
	),
});
