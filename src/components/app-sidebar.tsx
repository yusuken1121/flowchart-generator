"use client";

import {
  Calendar,
  Search,
  Settings,
  History,
  MessageSquarePlus,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Create Groups
const mainItems = [
  {
    title: "News Flowchart",
    url: "/",
    icon: MessageSquarePlus,
    activeColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "General Flowchart",
    url: "/general",
    icon: MessageCircle,
    activeColor: "text-purple-600 dark:text-purple-400",
  },
];

const manageItems = [
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-md">
            N
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold text-lg tracking-tight">News2Flow</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Generator
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            Create
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        h-10 transition-all duration-200 ease-in-out
                        ${
                          isActive
                            ? "bg-sidebar-accent shadow-sm"
                            : "hover:bg-sidebar-accent/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`
                            h-5 w-5 transition-colors
                            ${isActive ? item.activeColor : "text-muted-foreground"}
                          `}
                        />
                        <span
                          className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div
                            className={`ml-auto h-1.5 w-1.5 rounded-full ${item.activeColor.replace("text-", "bg-")}`}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {manageItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        h-10 transition-all duration-200 ease-in-out
                        ${
                          isActive
                            ? "bg-sidebar-accent shadow-sm"
                            : "hover:bg-sidebar-accent/50 hover:translate-x-1"
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`h-4.5 w-4.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="rounded-lg bg-sidebar-accent/50 p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold">U</span>
            </div>
            <div className="text-xs">
              <p className="font-medium">User</p>
              <p className="text-muted-foreground text-[10px]">Free Plan</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
