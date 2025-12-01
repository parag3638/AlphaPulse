"use client"

import * as React from "react"
import type { ComponentPropsWithoutRef } from "react"
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings2,
  SquareTerminal,
  BadgeDollarSign,
  Newspaper,
  Calendar1
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

// Sample data
const data = {
  user: { name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" },
  teams: [{ name: "AlphaPulse", logo: GalleryVerticalEnd, plan: "Enterprise" }],
  navMain: [
    {
      title: "Dashboard",
      url: "/vaultx/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Markets",
      url: "/vaultx/markets",
      icon: BadgeDollarSign,
    },
  ],
  projects: [
    { name: "News Analytics", url: "/vaultx/mood", icon: Newspaper },
    { name: "AI Foresight", url: "/vaultx/calendar", icon: Calendar1 },
  ],
};

function normalizePath(p: string) {
  if (!p) return "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function AppSidebar(props: ComponentPropsWithoutRef<typeof Sidebar>) {
  const raw = usePathname() || "/";
  const pathname = normalizePath(raw);

  // Build active states (parent is active if its URL matches or any child is active)
  const navMainWithActive = data.navMain.map((item: any) => {
    const itemUrl = normalizePath(item.url);
    const subItems =
      item.items?.map((sub: any) => {
        const subUrl = normalizePath(sub.url);
        return {
          ...sub,
          isActive: pathname === subUrl || pathname.startsWith(subUrl + "/"),
          exactActive: pathname === subUrl,
        };
      }) ?? [];

    const parentMatch = pathname === itemUrl || pathname.startsWith(itemUrl + "/");
    const childMatch = subItems.some((s: any) => s.isActive);
    const isActive = parentMatch || childMatch;
    const exactActive = pathname === itemUrl;

    return { ...item, isActive, exactActive, items: subItems };
  });

  const projectsWithActive = data.projects.map((project: any) => {
    const pUrl = normalizePath(project.url);
    const isActive = pathname === pUrl || pathname.startsWith(pUrl + "/");
    const exactActive = pathname === pUrl;
    return { ...project, isActive, exactActive };
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={navMainWithActive} />
        <NavProjects projects={projectsWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
