"use client";

import { usePathname } from "next/navigation";
import { Download, CircleDollarSign, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageTransactionDialog } from "@/components/dashboard/manage-transaction-dialog";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useInstallApp } from "@/hooks/use-install-app";

const getTitleFromPathname = (pathname: string) => {
  if (pathname.endsWith("/dashboard") || pathname === "/") return "Dashboard";
  if (pathname.endsWith("/budgets")) return "Budgets";
  if (pathname.endsWith("/categories")) return "Categories";
  if (pathname.endsWith("/reports")) return "Reports";
  if (pathname.endsWith("/tax-hub")) return "Tax Hub";
  if (pathname.endsWith("/shared-wallets")) return "Shared Wallets";
  if (pathname.includes("/blog")) return "Learn";
  return "Horizon";
};


export default function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isInstallable, installApp } = useInstallApp();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 md:px-6 transition-all duration-300 shadow-sm">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <h1 className="font-headline text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{getTitleFromPathname(pathname)}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4 relative z-10">
        {isInstallable && (
          <Button variant="outline" className="hidden sm:flex border-primary/20 hover:bg-primary/10 transition-colors" onClick={installApp}>
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        )}
        {isInstallable && (
          <Button variant="ghost" size="icon" className="sm:hidden text-primary" onClick={installApp} title="Install App">
            <Download className="h-5 w-5" />
          </Button>
        )}
        {user && (
          <ManageTransactionDialog>
            <Button>
              <PlusCircle className="h-4 w-4 sm:hidden" />
              <PlusCircle className="mr-2 hidden h-4 w-4 sm:inline" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </ManageTransactionDialog>
        )}
        {user && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
