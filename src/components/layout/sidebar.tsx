"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListChecks, LineChart, Calculator, BookOpen, Users } from "lucide-react";
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
            <Image src="/logo.png" alt="Horizon Logo" width={24} height={24} className="rounded object-contain" />
            <span className={cn("font-headline text-lg font-semibold", open ? "" : "hidden")}>Horizon</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton
                isActive={pathname === "/dashboard" || pathname?.endsWith("/dashboard")}
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
                isActive={pathname === "/budgets" || pathname?.endsWith("/budgets")}
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
                isActive={pathname === "/categories" || pathname?.endsWith("/categories")}
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
                isActive={pathname === "/reports" || pathname?.endsWith("/reports")}
                tooltip="Reports"
              >
                <LineChart />
                <span>Reports</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/tax-hub">
              <SidebarMenuButton
                isActive={pathname === "/tax-hub" || pathname?.endsWith("/tax-hub")}
                tooltip="Tax Hub"
              >
                <Calculator />
                <span>Tax Hub</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/shared-wallets">
              <SidebarMenuButton
                isActive={pathname === "/shared-wallets" || pathname?.endsWith("/shared-wallets")}
                tooltip="Shared Wallets"
              >
                <Users />
                <span>Shared Wallets</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/blog">
              <SidebarMenuButton
                isActive={pathname?.includes("/blog")}
                tooltip="Learn"
              >
                <BookOpen />
                <span>Learn</span>
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
