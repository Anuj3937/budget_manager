import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import NumberFlow from '@number-flow/react';
import { Skeleton } from "@/components/ui/skeleton";

type SummaryData = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};

type SummaryCardsProps = {
  data: SummaryData;
  isLoading: boolean;
};

import { useCurrency } from '@/hooks/use-currency';

const SummaryCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-1 h-3 w-28" />
    </CardContent>
  </Card>
);

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const { currency } = useCurrency();
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 w-full">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <NumberFlow value={data.totalBalance} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground">+2.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">
            <NumberFlow value={data.monthlyIncome} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground">This month's earnings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-rose-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-400">
            <NumberFlow value={data.monthlyExpenses} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground">This month's spending</p>
        </CardContent>
      </Card>
    </div>
  );
}
