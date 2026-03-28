import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import NumberFlow from '@number-flow/react';
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from '@/hooks/use-currency';

type SummaryData = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};

type SummaryCardsProps = {
  data: SummaryData;
  isLoading: boolean;
};

const SummaryCardSkeleton = () => (
  <Card className="glassmorphism border-border/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24 bg-foreground/10" />
      <Skeleton className="h-4 w-4 bg-foreground/10" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-32 bg-foreground/10" />
      <Skeleton className="mt-1 h-3 w-28 bg-foreground/10" />
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
    <div className="grid gap-4 md:grid-cols-3 w-full pt-2">
      <Card className="glassmorphism relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-border/50 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-colors duration-500 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</CardTitle>
          <Wallet className="h-5 w-5 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-headline font-bold text-foreground">
            <NumberFlow value={data.totalBalance} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center pr-1">
             <span className="text-primary font-medium mr-1">+2.1%</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card className="glassmorphism relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-border/50 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-colors duration-500 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Income</CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-headline font-bold text-emerald-500">
            <NumberFlow value={data.monthlyIncome} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total earnings this month</p>
        </CardContent>
      </Card>

      <Card className="glassmorphism relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border-border/50 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-colors duration-500 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Expenses</CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-rose-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-headline font-bold text-rose-500">
            <NumberFlow value={data.monthlyExpenses} format={{ style: 'currency', currency }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total spending this month</p>
        </CardContent>
      </Card>
    </div>
  );
}
