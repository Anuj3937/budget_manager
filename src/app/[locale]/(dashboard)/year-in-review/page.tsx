"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { 
  Loader2, 
  Share2, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  Coffee, 
  Wallet,
  CalendarDays 
} from "lucide-react";
import { format } from "date-fns";

import AppHeader from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/rule-engine";
import type { Transaction } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function YearInReviewPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  // Fetch transactions for the selected year
  useEffect(() => {
    async function fetchYearData() {
      if (!user) return;
      setIsLoading(true);
      
      const startOfYear = new Date(`${selectedYear}-01-01T00:00:00`);
      const endOfYear = new Date(`${selectedYear}-12-31T23:59:59`);
      
      const q = query(
        collection(firestore, `users/${user.uid}/transactions`),
        where("transactionDate", ">=", startOfYear),
        where("transactionDate", "<=", endOfYear),
        orderBy("transactionDate", "desc")
      );
      
      try {
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching year data", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchYearData();
  }, [user, firestore, selectedYear]);

  // Calculate Insights
  const insights = useMemo(() => {
    if (transactions.length === 0) return null;

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};
    const monthTotals: Record<string, number> = {};
    let largestTransaction: Transaction | null = null;

    transactions.forEach(t => {
      const amount = Number(t.amount);
      const category = t.categoryName || "Uncategorized";
      
      // Handle Firebase timestamp or Date
      const dateObj = t.transactionDate && 'toDate' in t.transactionDate 
          ? (t.transactionDate as any).toDate() 
          : new Date(t.transactionDate);
          
      const month = format(dateObj, "MMMM");

      if (t.type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        monthTotals[month] = (monthTotals[month] || 0) + amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["None", 0];
    const topMonth = Object.entries(monthTotals).sort((a, b) => b[1] - a[1])[0] || ["None", 0];
    
    // Explicitly calculate largest transaction to fix TS inference issues
    const expenses = transactions.filter(t => t.type === 'expense');
    largestTransaction = expenses.length > 0 
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: savingsRate.toFixed(1),
      topCategory: { name: topCategory[0], amount: topCategory[1] },
      topMonth: { name: topMonth[0], amount: topMonth[1] },
      largestTransaction,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  function handleShare() {
     toast({
         title: "Link Copied!",
         description: "Your Year in Review is ready to share on social media.",
     });
     navigator.clipboard.writeText(`https://horizon-finance.vercel.app/year-in-review?year=${selectedYear}&ref=share`);
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-black">
        
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 border-b border-white/10">
            <div>
               <h1 className="text-4xl md:text-6xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 flex items-center gap-4">
                 <Sparkles className="h-10 w-10 text-purple-400" />
                 Wrapped {selectedYear}
               </h1>
               <p className="text-muted-foreground mt-2 text-lg">Your financial journey, beautifully summarized.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px] bg-black border-white/20 text-white">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20 text-white backdrop-blur-xl">
                     <SelectItem value="2026">2026</SelectItem>
                     <SelectItem value="2025">2025</SelectItem>
                     <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
               </Select>
               <Button onClick={handleShare} className="bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Share2 className="mr-2 h-4 w-4" /> Share
               </Button>
            </div>
          </div>

          {isLoading ? (
             <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
             </div>
          ) : !insights ? (
             <Card className="bg-white/5 border-white/10 text-white p-12 text-center border-dashed">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No Data for {selectedYear}</h2>
                <p className="text-white/60">Log some transactions this year to generate your personalized financial wrapped.</p>
             </Card>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hero Stat: Savings */}
                <Card className="md:col-span-2 bg-gradient-to-br from-purple-900/40 via-black to-black border-white/10 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Trophy className="h-64 w-64" />
                   </div>
                   <CardContent className="p-8 md:p-12 relative z-10">
                      <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/20 mb-6">The Big Picture</Badge>
                      <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
                          {formatCurrency(insights.netSavings, 'en-IN', 'INR')}
                      </h2>
                      <p className="text-xl text-white/70">
                         Total money stashed away this year. You saved <strong className="text-white">{insights.savingsRate}%</strong> of your income!
                      </p>
                   </CardContent>
                </Card>

                {/* Top Category */}
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                   <CardContent className="p-8">
                      <Badge variant="outline" className="border-white/20 text-white pb-1 mb-6 flex w-fit items-center gap-2">
                        <Coffee className="h-3 w-3" /> Top Vice
                      </Badge>
                      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Most Spent On</h3>
                      <p className="text-3xl font-bold text-white mb-2">{insights.topCategory.name}</p>
                      <p className="text-amber-400 font-mono text-xl">{formatCurrency(insights.topCategory.amount, 'en-IN', 'INR')}</p>
                   </CardContent>
                </Card>

                {/* Top Month */}
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                   <CardContent className="p-8">
                      <Badge variant="outline" className="border-white/20 text-white pb-1 mb-6 flex w-fit items-center gap-2">
                         <CalendarDays className="h-3 w-3" /> Peak Season
                      </Badge>
                      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Highest Spend Month</h3>
                      <p className="text-3xl font-bold text-white mb-2">{insights.topMonth.name}</p>
                      <p className="text-rose-400 font-mono text-xl">{formatCurrency(insights.topMonth.amount, 'en-IN', 'INR')}</p>
                   </CardContent>
                </Card>

                {/* Largest Single Purchase */}
                {insights.largestTransaction && (
                  <Card className="md:col-span-2 bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border-white/10">
                     <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                           <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/20 mb-4 flex w-fit items-center gap-2">
                              <Wallet className="h-3 w-3" /> The Splurge
                           </Badge>
                           <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">Largest Single Transaction</h3>
                           <p className="text-2xl font-bold text-white">"{insights.largestTransaction.notes || insights.largestTransaction.categoryName}"</p>
                           <p className="text-white/40 mt-1">{format(new Date(insights.largestTransaction.transactionDate as any), "MMMM do, yyyy")}</p>
                        </div>
                        <div className="text-left md:text-right">
                           <p className="text-4xl md:text-5xl font-mono text-emerald-400 font-light">
                              {formatCurrency(insights.largestTransaction.amount, 'en-IN', 'INR')}
                           </p>
                        </div>
                     </CardContent>
                  </Card>
                )}

             </div>
          )}

          {/* Footer Watermark for sharing */}
          {!isLoading && insights && (
            <div className="pt-12 text-center opacity-50 flex items-center justify-center gap-2">
               <TrendingUp className="h-4 w-4 text-white" />
               <span className="text-white font-headline tracking-widest uppercase text-xs">Generated by Horizon Finance</span>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
