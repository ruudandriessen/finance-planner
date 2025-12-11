import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<h1 className="text-3xl font-bold text-foreground">Finance Planner</h1>
			<p className="text-muted-foreground mt-2">Welcome to your personal finance planning application!</p>
		</div>
	);
}
