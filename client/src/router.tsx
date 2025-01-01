// In your router configuration file (e.g., App.jsx or router.jsx)
import { createBrowserRouter } from "react-router-dom";
import TradingTerminal from "~/terminal/trading-terminal";

import Agent from "./Agent";
import Character from "./Character";
import Chat from "./Chat";
import Layout from "./Layout";
import WalletPage from "./pages/WalletPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <WalletPage />,
            },
            {
                path: "terminal",
                element: <TradingTerminal />,
            },
            {
                path: "wallet/chat",
                element: <Chat />,
            },
            {
                path: ":agentId",
                children: [
                    {
                        path: "",
                        element: <Agent />,
                    },
                    {
                        path: "chat",
                        element: <Chat />,
                    },
                    {
                        path: "character",
                        element: <Character />,
                    },
                ],
            },
        ],
    },
]);
