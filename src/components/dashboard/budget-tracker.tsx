import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Budget, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCurrency } from '@/hooks/use-currency';
import { isSameMonth } from "date-fns";

export default function BudgetTracker({ budgets, transactions }: { budgets: Budget[], transactions: Transaction[] }) {
  const { format: formatCurrency } = useCurrency();
  const currentMonthTransactions = transactions.filter(t => {
    const d = t.transactionDate && 'toDate' in t.transactionDate ? (t.transactionDate as any).toDate() : new Date(t.transactionDate as any);
    return isSameMonth(d, new Date());
  });

  const totalIncome = currentMonthTransactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0);

  const calculateSpending = (categoryId: string) => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <Card className="glassmorphism relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader>
        <CardTitle className="font-headline tracking-tight text-xl">Budget Tracker</CardTitle>
        <CardDescription>Your monthly spending limits and income allocation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No active budgets found.</p>
        )}
        {budgets.map((budget) => {
          const spent = calculateSpending(budget.categoryId);
          const progress = (spent / budget.limitAmount) * 100;
          const incomePercentage = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;
          
          let progressColor = "[&>div]:bg-emerald-500";
          if (progress >= 70 && progress <= 90) progressColor = "[&>div]:bg-amber-400";
          else if (progress > 90) progressColor = "[&>div]:bg-destructive";

          const isOverBudget = progress > 90;

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{budget.categoryName}</p>
                  {totalIncome > 0 && (
                     <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                        {incomePercentage.toFixed(1)}% of Income
                     </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    <span className={cn("font-semibold font-mono", isOverBudget ? "text-destructive" : "text-foreground")}>
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-xs mx-1">/</span>
                    <span className="text-xs">{formatCurrency(budget.limitAmount)}</span>
                  </p>
                </div>
              </div>
              <div className={cn("h-2 rounded-full", progressColor)}>
                 <Progress value={progress} className="h-2 bg-foreground/5 shadow-inner" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
