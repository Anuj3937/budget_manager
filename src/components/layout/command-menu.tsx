"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Calculator,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Moon,
  PieChart,
  Settings,
  Sun,
  Tags,
  Users,
  Wallet,
  BookOpen,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Record Expense</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tax-hub"))}>
              <Calculator className="mr-2 h-4 w-4 text-purple-500" />
              <span>Calculate Tax (India)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/budgets"))}>
              <PieChart className="mr-2 h-4 w-4" />
              <span>Budgets</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/categories"))}>
              <Tags className="mr-2 h-4 w-4" />
              <span>Categories & Auto-Rules</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/reports"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/year-in-review"))}>
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              <span>Year in Review (Wrapped)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/shared-wallets"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Shared Wallets</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/blog"))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Learn (Blog)</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings & Theme">
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>System Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
