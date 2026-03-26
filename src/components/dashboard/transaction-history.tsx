"use client";

import { Download, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { DataTable } from "@/components/shared/data-table";
import { transactionColumns } from "./transaction-columns";
import { Timestamp } from "firebase/firestore";

export default function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  const handleExportCSV = () => {
    if (!transactions.length) return;

    const headers = ["Date", "Type", "Amount", "Category", "Notes"];
    const csvRows = [
      headers.join(","),
      ...transactions.map(t => {
        let dateStr = '';
        if (t.transactionDate instanceof Timestamp) {
          dateStr = t.transactionDate.toDate().toISOString().split('T')[0];
        } else if (t.transactionDate instanceof Date) {
          dateStr = t.transactionDate.toISOString().split('T')[0];
        }
        
        return [
          dateStr,
          t.type,
          t.amount,
          `"${t.categoryName || 'Uncategorized'}"`,
          `"${(t.notes || '').replace(/"/g, '""')}"`
        ].join(",");
      })
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A list of your recent transactions.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={transactionColumns} 
          data={transactions} 
          filterColumn="categoryName" 
          emptyState={
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                <SearchX className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-1">No Transactions Found</h3>
              <p className="text-sm text-slate-500 max-w-sm">We couldn't find any financial activity mapping to these specific parameters. Adjust your dashboard filters to see more data.</p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
