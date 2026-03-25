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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetTracker({ budgets, transactions }: { budgets: Budget[], transactions: Transaction[] }) {
  const calculateSpending = (categoryId: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === categoryId)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracker</CardTitle>
        <CardDescription>Your monthly spending limits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const spent = calculateSpending(budget.categoryId);
          const progress = (spent / budget.limitAmount) * 100;
          
          let progressColor = "[&>div]:bg-emerald-500";
          if (progress >= 70 && progress <= 90) progressColor = "[&>div]:bg-amber-400";
          else if (progress > 90) progressColor = "[&>div]:bg-destructive";

          const isOverBudget = progress > 90;

          return (
            <div key={budget.id} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium">{budget.categoryName}</p>
                <p className="text-sm text-muted-foreground">
                  <span className={cn("font-semibold", isOverBudget ? "text-destructive" : "text-card-foreground")}>
                    {formatCurrency(spent)}
                  </span>
                  {' / '}
                  {formatCurrency(budget.limitAmount)}
                </p>
              </div>
              <div className={progressColor}>
                 <Progress value={progress} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
