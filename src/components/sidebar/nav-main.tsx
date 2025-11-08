"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type SubItem = {
  title: string
  url: string
  isActive?: boolean
}

type Item = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: SubItem[]
  exactActive?: boolean
}

export function NavMain({ items }: { items: Item[] }) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={`${item.title}-${item.isActive ? "open" : "closed"}`} // force re-eval on route change
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={item.exactActive} asChild>
                  <Link href={item.url} aria-current={item.exactActive ? "page" : undefined}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {/* <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                  </Link>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
