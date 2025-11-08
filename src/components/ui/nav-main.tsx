"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NavMain({ items }: { items: SidebarItemType[] }) {
  const pathname = usePathname(); // Get current path

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>File Guardian</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url; // Active state detection

              return (
                <SidebarMenuItem key={item.title}>
                  {/* Sidebar Menu Button */}
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

// Define SidebarItemType to match expected data structure
type SidebarItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};
