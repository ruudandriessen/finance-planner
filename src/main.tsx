import { Router, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootNode = document.getElementById("root");
if (!rootNode) throw new Error("Root node not found");
ReactDOM.createRoot(rootNode).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
