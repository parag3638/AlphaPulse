"use client"

import { LogOut, Sparkles, ChevronsUpDown } from "lucide-react"
import Cookies from "js-cookie"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

// Define Props Interface
interface UserProps {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

export function NavUser({ user }: { user: UserProps }) {
  const { isMobile } = useSidebar();

  const logout = () => {
    Cookies.remove("token");
    window.location.href = "/"; // Redirect to login page
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-[10px]">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] max-w-56 rounded-lg text-sm font-normal hover:cursor-pointer"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-[10px]">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-700 font-normal hover:cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
