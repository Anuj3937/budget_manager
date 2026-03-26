"use client";

import { useMemo } from "react";
import { collection } from "firebase/firestore";
import { AlertTriangle, TrendingDown, TrendingUp, RefreshCw, Lightbulb, Zap } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import type { Transaction } from "@/lib/types";
import { getAllInsights, type SpendingInsight } from "@/lib/insights-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  anomaly: AlertTriangle,
  trend: TrendingUp,
  recurring: RefreshCw,
  milestone: Zap,
  tip: Lightbulb,
};

const severityStyles = {
  info: "border-blue-500/30 bg-blue-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  success: "border-green-500/30 bg-green-500/5",
};

const severityBadge = {
  info: "default" as const,
  warning: "destructive" as const,
  success: "default" as const,
};

export function InsightsWidget() {
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
  }, [firestore, user]);

  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  const insights = useMemo(() => {
    if (!transactions?.length) return [];
    return getAllInsights(transactions);
  }, [transactions]);

  if (!insights.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.slice(0, 5).map((insight, i) => {
          const Icon = iconMap[insight.type] || Lightbulb;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${severityStyles[insight.severity]}`}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
