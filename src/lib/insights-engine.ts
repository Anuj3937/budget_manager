/**
 * Algorithmic Insights Engine
 * Pure math. Zero AI. Infinite scale.
 * Provides spending pattern analysis, anomaly detection, and forecasting.
 */

import type { Transaction } from '@/lib/types';

export interface SpendingInsight {
  type: 'anomaly' | 'trend' | 'recurring' | 'milestone' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  amount?: number;
  category?: string;
}

/**
 * Detect recurring transactions (e.g., subscriptions).
 * Groups by category + similar amounts and identifies monthly patterns.
 */
export function detectRecurringTransactions(transactions: Transaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const expensesByCategory = new Map<string, Transaction[]>();

  // Group expenses by category
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const key = t.categoryName || 'Uncategorized';
    if (!expensesByCategory.has(key)) expensesByCategory.set(key, []);
    expensesByCategory.get(key)!.push(t);
  }

  // Look for patterns: same category, similar amount, monthly cadence
  for (const [category, txns] of expensesByCategory) {
    if (txns.length < 2) continue;

    // Group by similar amounts (within 10% tolerance)
    const amountGroups = new Map<number, Transaction[]>();
    for (const t of txns) {
      let matched = false;
      for (const [baseAmount, group] of amountGroups) {
        if (Math.abs(t.amount - baseAmount) / baseAmount < 0.1) {
          group.push(t);
          matched = true;
          break;
        }
      }
      if (!matched) {
        amountGroups.set(t.amount, [t]);
      }
    }

    for (const [amount, group] of amountGroups) {
      if (group.length >= 2) {
        insights.push({
          type: 'recurring',
          title: `Recurring: ${category}`,
          description: `You have ${group.length} similar payments of ~${amount.toFixed(0)} in ${category}. This might be a subscription.`,
          severity: 'info',
          amount,
          category,
        });
      }
    }
  }

  return insights;
}

/**
 * Detect spending anomalies using simple standard deviation.
 * Flags any single transaction that is > 2 standard deviations from the mean.
 */
export function detectAnomalies(transactions: Transaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length < 5) return insights; // Need enough data

  const amounts = expenses.map((t) => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length
  );

  const threshold = mean + 2 * stdDev;

  for (const t of expenses) {
    if (t.amount > threshold) {
      insights.push({
        type: 'anomaly',
        title: `Unusual Spending Detected`,
        description: `A ${t.categoryName || 'transaction'} of ${t.amount.toFixed(0)} is significantly higher than your average of ${mean.toFixed(0)}.`,
        severity: 'warning',
        amount: t.amount,
        category: t.categoryName,
      });
    }
  }

  return insights;
}

/**
 * Calculate "Safe to Spend" metric.
 * Based on remaining budget after projected recurring expenses.
 */
export function calculateSafeToSpend(
  monthlyIncome: number,
  transactions: Transaction[],
  daysInMonth: number = 30,
  currentDay: number = new Date().getDate()
): {
  safeToSpend: number;
  dailyBudget: number;
  totalSpentThisMonth: number;
  projectedMonthEnd: number;
} {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const date = t.transactionDate instanceof Date
      ? t.transactionDate
      : (t.transactionDate as any).toDate?.() || new Date(t.transactionDate as any);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const totalSpentThisMonth = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const remainingBudget = Math.max(0, monthlyIncome - totalSpentThisMonth);
  const dailyBudget = remainingBudget / remainingDays;

  // Project month-end spending based on daily average
  const dailyAvgSoFar = currentDay > 0 ? totalSpentThisMonth / currentDay : 0;
  const projectedMonthEnd = dailyAvgSoFar * daysInMonth;

  return {
    safeToSpend: remainingBudget,
    dailyBudget,
    totalSpentThisMonth,
    projectedMonthEnd,
  };
}

/**
 * Generate spending trends (month-over-month comparison).
 */
export function generateSpendingTrends(transactions: Transaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const thisYear = now.getFullYear();
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const getMonth = (t: Transaction): { month: number; year: number } => {
    const date = t.transactionDate instanceof Date
      ? t.transactionDate
      : (t.transactionDate as any).toDate?.() || new Date(t.transactionDate as any);
    return { month: date.getMonth(), year: date.getFullYear() };
  };

  const thisMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && getMonth(t).month === thisMonth && getMonth(t).year === thisYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && getMonth(t).month === lastMonth && getMonth(t).year === lastMonthYear)
    .reduce((sum, t) => sum + t.amount, 0);

  if (lastMonthExpenses > 0) {
    const change = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    
    if (change > 20) {
      insights.push({
        type: 'trend',
        title: 'Spending Up ↑',
        description: `You've spent ${change.toFixed(0)}% more this month compared to last month. Consider reviewing your discretionary spending.`,
        severity: 'warning',
        amount: thisMonthExpenses,
      });
    } else if (change < -10) {
      insights.push({
        type: 'trend',
        title: 'Great Savings! ↓',
        description: `You've spent ${Math.abs(change).toFixed(0)}% less this month compared to last month. Keep it up!`,
        severity: 'success',
        amount: thisMonthExpenses,
      });
    }
  }

  return insights;
}

/**
 * Get all insights for the current user.
 */
export function getAllInsights(transactions: Transaction[]): SpendingInsight[] {
  return [
    ...detectAnomalies(transactions),
    ...detectRecurringTransactions(transactions),
    ...generateSpendingTrends(transactions),
  ];
}
