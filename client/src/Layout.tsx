import { Outlet } from "react-router-dom";

import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";

export default function Layout() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <AppSidebar />
                <main className="flex-1 p-4 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
