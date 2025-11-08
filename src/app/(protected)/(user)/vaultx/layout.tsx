"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathnameRaw = usePathname() || "/";
  const pathname = pathnameRaw.replace(/\/+$/, ""); // strip trailing slash
  const ROUTE_LABELS: Record<string, string> = {
    "/vaultx/dashboard": "Dashboard",
    "/vaultx/markets": "Markets",
    "/vaultx/mood": "Market Mood",
    "/vaultx/calendar": "Events",
  };
  // Longest-prefix match so /vaultx/inbox/123 -> Inbox
  const matchedKey =
    Object.keys(ROUTE_LABELS)
      .filter((k) => pathname === k || pathname.startsWith(k + "/"))
      .sort((a, b) => b.length - a.length)[0] ?? "";
  const breadcrumb = ROUTE_LABELS[matchedKey] ?? "Other";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/vaultx/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
