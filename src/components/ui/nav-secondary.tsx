import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"; // Next.js router hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"


export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname(); // Get current path from Next.js router

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url; // Check active state
            return (
              <SidebarMenuItem key={item.title}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <span className="flex items-center gap-2">
                          <item.icon />
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Under Development</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

