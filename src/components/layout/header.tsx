"use client";

import { usePathname } from "next/navigation";
import { CircleDollarSign, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageTransactionDialog } from "@/components/dashboard/manage-transaction-dialog";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const getTitleFromPathname = (pathname: string) => {
  switch (pathname) {
    case "/":
      return "Dashboard";
    case "/budgets":
      return "Budgets";
    case "/categories":
      return "Categories";
    case "/reports":
      return "Reports";
    default:
      return "Cashflow Clarity";
  }
};


export default function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 backdrop-blur-md px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <h1 className="font-headline text-xl font-bold text-foreground">{getTitleFromPathname(pathname)}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <ManageTransactionDialog>
            <Button>
              <PlusCircle className="h-4 w-4 sm:hidden" />
              <PlusCircle className="mr-2 hidden h-4 w-4 sm:inline" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </ManageTransactionDialog>
        )}
        <ThemeToggle />
        {user && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
