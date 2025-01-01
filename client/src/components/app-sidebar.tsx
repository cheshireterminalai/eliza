import type { LucideIcon } from "lucide-react";
import {
    Calendar,
    Inbox,
    LineChart,
    Wallet,
} from "lucide-react";
import {
    Link,
    useParams,
} from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./ui/sidebar";

interface MenuItem {
    title: string;
    url: string;
    icon: LucideIcon;
}


export function AppSidebar() {
    const { agentId } = useParams<{ agentId: string }>();

    const items: MenuItem[] = [
        {
            title: "Chat",
            url: agentId ? `/${agentId}/chat` : '/chat',
            icon: Inbox,
        },
        {
            title: "Character Overview",
            url: agentId ? `/${agentId}/character` : '/character',
            icon: Calendar,
        },
        {
            title: "Wallet",
            url: "/wallet",
            icon: Wallet,
        },
        {
            title: "Trading Terminal",
            url: "/terminal",
            icon: LineChart,
        },
    ];

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
