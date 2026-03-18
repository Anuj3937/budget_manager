"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDollarSign, LayoutDashboard, FolderKanban, ListChecks, LineChart } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Button variant="ghost" className="flex-1 justify-start gap-2">
            <CircleDollarSign className="size-6 text-primary" />
            <span className={cn("font-headline text-lg font-semibold", open ? "" : "hidden")}>Cashflow Clarity</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton
                isActive={pathname === "/dashboard"}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Link href="/budgets">
              <SidebarMenuButton
                isActive={pathname === "/budgets"}
                tooltip="Budgets"
              >
                <FolderKanban />
                <span>Budgets</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/categories">
              <SidebarMenuButton
                isActive={pathname === "/categories"}
                tooltip="Categories"
              >
                <ListChecks />
                <span>Categories</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/reports">
              <SidebarMenuButton
                isActive={pathname === "/reports"}
                tooltip="Reports"
              >
                <LineChart />
                <span>Reports</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );
}
