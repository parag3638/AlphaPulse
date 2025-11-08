"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import Link from "next/link"

type Project = {
  name: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  exactActive?: boolean
}

export function NavProjects({ projects }: { projects: Project[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden py-1">
      <SidebarGroupLabel>Quantum Brief</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={item.exactActive}>

              <Link href={item.url} aria-current={item.exactActive ? "page" : undefined}>
                <item.icon />
                <span>{item.name}</span>
              </Link>

            </SidebarMenuButton>

          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
