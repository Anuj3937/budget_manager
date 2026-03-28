"use client";

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Transaction } from "@/lib/types";
import { DateRange } from 'react-day-picker';
import { Timestamp } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRangePicker } from './date-range-picker';
import IncomeExpenseChart from '@/components/dashboard/income-expense-chart';
import ExpenseCategoryChart from '@/components/dashboard/expense-category-chart';
import { DataTable } from '@/components/shared/data-table';
import { transactionColumns } from '@/components/dashboard/transaction-columns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateTransactionsCSV, downloadCSV } from '@/lib/csv-export';

import { useCurrency } from '@/hooks/use-currency';

interface ReportsDashboardProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export default function ReportsDashboard({ date, setDate }: ReportsDashboardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { format: formatCurrency } = useCurrency();

    const transactionsQuery = useMemoFirebase(() => {
        if (!user || !date?.from) return null;
        return query(
          collection(firestore, `users/${user.uid}/transactions`),
          where('transactionDate', '>=', date.from),
          where('transactionDate', '<=', date.to || new Date()),
          orderBy('transactionDate', 'desc')
        );
      }, [firestore, user, date]);
    
    const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const toDate = (d: Date | Timestamp): Date => {
        if (d instanceof Timestamp) {
          return d.toDate();
        }
        return new Date(d);
      };

    const summaryData = useMemo(() => {
        const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 0;
        const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0;
        return {
          totalIncome: income,
          totalExpenses: expenses,
          netFlow: income - expenses,
        };
      }, [transactions]);
    
      const incomeVsExpensesData = useMemo(() => {
        if (!transactions || !date?.from) return [];
        const to = date.to || new Date();
    
        const trendData: { [key: string]: { income: number; expenses: number } } = {};
        
        // Initialize all days in the range to 0
        for (let d = new Date(date.from); d <= to; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toISOString().split('T')[0];
            trendData[dayKey] = { income: 0, expenses: 0 };
        }
    
        transactions.forEach(t => {
          const tDate = toDate(t.transactionDate).toISOString().split('T')[0];
          if (trendData[tDate]) {
            if (t.type === 'income') {
              trendData[tDate].income += t.amount;
            } else {
              trendData[tDate].expenses += t.amount;
            }
          }
        });
        
        return Object.entries(trendData).map(([day, data]) => ({
          month: new Date(day + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' }), // Use a consistent format
          ...data
        })).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    
      }, [transactions, date]);
    
      const expenseByCategoryData = useMemo(() => {
        if (!transactions) return [];
        const categoryTotals: { [key: string]: number } = {};
    
        transactions.filter(t => t.type === 'expense').forEach(t => {
          const categoryName = t.categoryName || 'Uncategorized';
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = 0;
          }
          categoryTotals[categoryName] += t.amount;
        });
        
        return Object.entries(categoryTotals).map(([name, value], index) => ({
          name,
          value,
          fill: `hsl(var(--chart-${(index % 5) + 1}))`
        }));
      }, [transactions]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-headline text-2xl font-bold text-foreground">Financial Reports</h1>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        disabled={!transactions || transactions.length === 0}
                        onClick={() => {
                            if (transactions) {
                                const csv = generateTransactionsCSV(transactions);
                                downloadCSV(csv, `horizon-export-${new Date().toISOString().split('T')[0]}.csv`);
                            }
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <DateRangePicker date={date} setDate={setDate} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-emerald-400">{formatCurrency(summaryData.totalIncome)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-rose-400">{formatCurrency(summaryData.totalExpenses)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Net Cash Flow</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(summaryData.netFlow)}</p></CardContent>
                </Card>
            </div>
            
            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
                {transactionsLoading ? (
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

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>All transactions within the selected date range.</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactionsLoading ? (
                        <Skeleton className="h-96" />
                    ) : (
                        <DataTable columns={transactionColumns} data={transactions || []} filterColumn="categoryName" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
