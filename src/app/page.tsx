"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

import AppHeader from "@/components/layout/header";
import SummaryCards from "@/components/dashboard/summary-cards";
import dynamic from 'next/dynamic';

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
  
  const summaryData = useMemo(() => ({
    totalBalance: transactions?.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0) || 0,
    monthlyIncome: transactions?.filter(t => t.type === 'income' && toDate(t.transactionDate).getMonth() === new Date().getMonth()).reduce((acc, t) => acc + t.amount, 0) || 0,
    monthlyExpenses: transactions?.filter(t => t.type === 'expense' && toDate(t.transactionDate).getMonth() === new Date().getMonth()).reduce((acc, t) => acc + t.amount, 0) || 0,
  }), [transactions]);

  const incomeVsExpensesData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() };
    }).reverse();

    return last6Months.map(({ month, year }) => {
      const monthlyTransactions = transactions?.filter(t => {
        const transactionDate = toDate(t.transactionDate);
        return transactionDate.getMonth() === new Date(`${month} 1, ${year}`).getMonth() && transactionDate.getFullYear() === year;
      }) || [];
      return {
        month,
        income: monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        expenses: monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      };
    });
  }, [transactions]);
  
  const expenseByCategoryData = useMemo(() => budgets?.map(b => ({
    name: b.categoryName || 'Unnamed Category',
    value: transactions?.filter(t => t.categoryId === b.categoryId && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0,
    fill: categoryColors.get(b.categoryId) || `hsl(var(--muted-foreground))`
  })) || [], [budgets, transactions, categoryColors]);

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
        <SummaryCards data={summaryData} isLoading={isLoading} />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
          {isLoading ? (
            <>
              <Skeleton className="lg:col-span-4 h-[380px]" />
              <Skeleton className="lg:col-span-3 h-[380px]" />
            </>
          ) : (
            <>
              <IncomeExpenseChart data={incomeVsExpensesData} />
              <ExpenseCategoryChart data={expenseByCategoryData} />
            </>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isLoading ? <Skeleton className="h-[400px]" /> : <TransactionHistory transactions={transactions || []} />}
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
