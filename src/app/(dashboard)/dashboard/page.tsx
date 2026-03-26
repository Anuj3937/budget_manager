"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, Sparkles } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

import AppHeader from "@/components/layout/header";
import dynamic from 'next/dynamic';
import { DateRange } from 'react-day-picker';
import { subDays, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import SummaryCards from "@/components/dashboard/summary-cards";

const IncomeExpenseChart = dynamic(() => import("@/components/dashboard/income-expense-chart"), { ssr: false });
const ExpenseCategoryChart = dynamic(() => import("@/components/dashboard/expense-category-chart"), { ssr: false });
import TransactionHistory from "@/components/dashboard/transaction-history";
import BudgetTracker from "@/components/dashboard/budget-tracker";
import IncomeAllocator from "@/components/dashboard/income-allocator";
import OnboardingWizard from '@/components/onboarding/onboarding-wizard';

import type { Transaction, Budget, Category } from "@/lib/types";
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('transactionDate', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/budgets`);
  }, [firestore, user]);
  
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toDate = (date: Date | Timestamp): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return new Date(date);
  };
  
  const categoryColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    if (!budgets) return colorMap;
    
    budgets.forEach((budget, index) => {
        colorMap.set(budget.categoryId, `hsl(var(--chart-${(index % 5) + 1}))`);
    });
    return colorMap;
  }, [budgets]);
  
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!dateRange?.from || !dateRange?.to) return transactions;
    
    return transactions.filter(t => {
      const tDate = toDate(t.transactionDate);
      return isWithinInterval(tDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!)
      });
    });
  }, [transactions, dateRange]);

  const summaryData = useMemo(() => ({
    totalBalance: filteredTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0),
    monthlyIncome: filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    monthlyExpenses: filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  }), [filteredTransactions]);

  const incomeVsExpensesData = useMemo(() => {
    // Group filtered transactions by Day formatted string
    const grouped = filteredTransactions.reduce((acc, t) => {
      const dateStr = format(toDate(t.transactionDate), "LLL dd");
      if (!acc[dateStr]) acc[dateStr] = { income: 0, expenses: 0 };
      if (t.type === 'income') acc[dateStr].income += t.amount;
      if (t.type === 'expense') acc[dateStr].expenses += t.amount;
      return acc;
    }, {} as Record<string, { income: number, expenses: number }>);

    // Sort by date chronologically
    return Object.keys(grouped).sort((a, b) => new Date(`${a}, ${new Date().getFullYear()}`).getTime() - new Date(`${b}, ${new Date().getFullYear()}`).getTime()).map(date => ({
      month: date, // Renamed functionally internally to month to preserve chart prop signatures if needed, but actually holding day
      income: grouped[date].income,
      expenses: grouped[date].expenses,
    }));
  }, [filteredTransactions]);
  
  const expenseByCategoryData = useMemo(() => budgets?.map(b => ({
    name: b.categoryName || 'Unnamed Category',
    value: filteredTransactions.filter(t => t.categoryId === b.categoryId && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0,
    fill: categoryColors.get(b.categoryId) || `hsl(var(--muted-foreground))`
  })).filter(d => d.value > 0) || [], [budgets, filteredTransactions, categoryColors]);

  const aiInsight = useMemo(() => {
    if (summaryData.monthlyIncome === 0 && summaryData.monthlyExpenses === 0) {
      return "Log your first transactions to activate intelligent cashflow analysis.";
    }
    
    if (summaryData.monthlyIncome === 0) {
      return "Warning: Critical capital bleed with zero recorded income. Secure cash reserves immediately.";
    }
    
    const burnRate = (summaryData.monthlyExpenses / summaryData.monthlyIncome) * 100;
    
    let topCategory = "Miscellaneous";
    if (expenseByCategoryData && expenseByCategoryData.length > 0) {
       const top = [...expenseByCategoryData].sort((a,b) => b.value - a.value)[0];
       topCategory = top.name;
    }

    if (burnRate > 90) {
      return `Critical Burn Rate: You are pacing to consume ${Math.round(burnRate)}% of your income. Throttle spend in '${topCategory}'.`;
    } else if (burnRate > 60) {
      return `Moderate Cashflow: Capital consumption is at ${Math.round(burnRate)}%. Optimize '${topCategory}' to increase savings velocity.`;
    } else {
      return `Elite Efficiency: You are retaining ${Math.round(100 - burnRate)}% of your income. Your cash reserves are scaling exponentially.`;
    }
  }, [summaryData, expenseByCategoryData]);

  // Overall loading state for skeleton UI
  const isLoading = isUserLoading || transactionsLoading || budgetsLoading || categoriesLoading;
  
  const isNewUser = !isLoading && user && (transactions?.length === 0 && categories?.length === 0);

  // If there's no user and we are not loading, the useEffect will handle redirection.
  // Render a loader to prevent a flash of empty content before redirection.
  if (!user && !isUserLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isNewUser) {
    return (
      <>
        <AppHeader />
        <OnboardingWizard />
      </>
    );
  }


  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Analytics Overview</h1>
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit shrink-0">
               <Sparkles className="w-4 h-4 text-primary shrink-0" />
               <p className="text-xs font-medium text-slate-300">{aiInsight}</p>
            </div>
          </div>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
        <SummaryCards data={summaryData} isLoading={isLoading} />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
          {isLoading ? (
            <>
              <Skeleton className="lg:col-span-4 h-[380px]" />
              <Skeleton className="lg:col-span-3 h-[380px]" />
            </>
          ) : (
            <>
              <ExpenseCategoryChart 
                data={expenseByCategoryData} 
                selectedCategory={selectedCategory} 
                onCategorySelect={(cat: string) => setSelectedCategory(prev => prev === cat ? null : cat)} 
              />
            </>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isLoading ? <Skeleton className="h-[300px] md:h-[400px]" /> : <TransactionHistory transactions={filteredTransactions.filter(t => !selectedCategory || t.categoryName === selectedCategory) || []} />}
          </div>
          <div className="space-y-4 lg:space-y-8">
            {isLoading ? (
              <>
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[280px]" />
                <Skeleton className="h-[180px]" />
              </>
            ) : (
             <>
                <BudgetTracker budgets={budgets || []} transactions={transactions || []} />
                <IncomeAllocator categories={categories || []} budgets={budgets || []} />
             </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
