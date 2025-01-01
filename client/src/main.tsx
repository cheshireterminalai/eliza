import "./polyfills";
import "./index.css";

import React from "react";

import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import { router } from "./router";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Add dark theme class to root html element
document.documentElement.classList.add('dark');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
