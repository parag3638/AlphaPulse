"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import NextLink from "next/link";

import { useRouter } from "next/navigation";
import axios from "axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useUser } from "@/components/auth/UserContext";


export function NavUser() {

  const { isMobile } = useSidebar()
  const user: any = useUser() || null;

  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await axios.post(
        "https://authbackend-cc2d.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (res.status === 204) {
        // successful logout
        router.replace("/");
      } else {
        console.error("Logout failed");
      }
    } catch (e) {
      if ((e as any)?.response?.status === 401) {
        router.replace("/login");
        return;
      }
      console.error("Logout error", e);
    }
  }


  // Generate a random color for avatar background (pick from a set for consistency)
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"
  ];

  // Use a hash of the name for consistent color per user
  function getColor(name: string = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }
  const avatarColor = getColor(user?.name);
  // Get initials from name (e.g., 'AB' for 'Alla Ben')
  function getInitials(name: string = "") {
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 0) return "U";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  const avatarInitials = getInitials(user?.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={user.name} />
                <AvatarFallback className={`rounded-lg font-semibold ${avatarColor} text-white`}>{avatarInitials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className={`rounded-lg font-semibold ${avatarColor} text-white`}>{avatarInitials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <NextLink href="/vaultx/cooking" className="flex items-center gap-2 w-full">
                  <Sparkles />
                  Upgrade to Pro
                </NextLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <NextLink href="/vaultx/cooking" className="flex items-center gap-2 w-full">
                  <BadgeCheck />
                  Account
                </NextLink>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                <NextLink href="/vaultx/cooking" className="flex items-center gap-2 w-full">
                  <Bell />
                  Notifications
                </NextLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer text-red-600" onSelect={e => e.preventDefault()}>
                  <LogOut />
                  <span>Log out</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? This will end your session and require you to log in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" className="bg-red-600" onClick={handleLogout}>
                      Log out
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
