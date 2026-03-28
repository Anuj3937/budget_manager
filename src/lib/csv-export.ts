import { format } from "date-fns";
import type { Transaction } from "./types";
import { formatCurrency } from "./rule-engine";

/**
 * Converts an array of transactions into a CSV format string.
 * This is crucial for Data Portability (GDPR/CCPA) and allows users
 * to export to ClearTax, TurboTax, or their CPAs.
 */
export function generateTransactionsCSV(transactions: Transaction[]): string {
  // 1. Define standard CSV Headers
  const headers = [
    "Date",
    "Type",
    "Amount",
    "Currency",
    "Category",
    "Notes",
    "Transaction ID",
  ];

  // 2. Map data rows
  const rows = transactions.map((t) => {
    // Determine the JS Date object
    const dateObj = t.transactionDate && 'toDate' in t.transactionDate 
      ? t.transactionDate.toDate() 
      : new Date(t.transactionDate as any);
      
    const formattedDate = format(dateObj, "yyyy-MM-dd");
    
    // We strip commas from notes to prevent CSV column breaking
    const safeNotes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "";

    return [
      formattedDate,
      t.type.toUpperCase(),
      t.amount.toString(),
      "Local", // Representing the local currency unit
      t.categoryName || "Uncategorized",
      safeNotes,
      t.id,
    ].join(",");
  });

  // 3. Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Triggers a browser download of the generated CSV string.
 */
export function downloadCSV(csvContent: string, filename: string = "horizon-export.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
