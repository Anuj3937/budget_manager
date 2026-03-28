"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import { useFirestore, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { ManageTransactionDialog } from "./manage-transaction-dialog";
import { DeleteConfirmationDialog } from "../shared/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

import { useCurrency } from '@/hooks/use-currency';

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transactionDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("transactionDate") as any;
      return <div>{format(new Date(date.seconds * 1000), "PPP")}</div>;
    },
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("categoryName")}</Badge>,
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: function AmountCell({ row }) {
      const { format: formatCurrency } = useCurrency();
      const amount = parseFloat(row.getValue("amount"));
      const type = row.original.type;
      const formatted = formatCurrency(amount);

      return (
        <div
          className={cn(
            "text-right font-medium",
            type === "income" ? "text-emerald-500" : "text-rose-500"
          )}
        >
          {type === "income" ? "+" : "-"}
          {formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: function Actions({ row }) {
      const transaction = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const firestore = useFirestore();
      const { user } = useUser();
      const { toast } = useToast();

      const handleDelete = () => {
        if (!user) return;
        const docRef = doc(firestore, `users/${user.uid}/transactions/${transaction.id}`);
        deleteDocumentNonBlocking(docRef);
        toast({ title: "Transaction deleted successfully" });
        setIsDeleteOpen(false);
      };

      return (
        <>
          <ManageTransactionDialog
            transaction={transaction}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          >
            <span />
          </ManageTransactionDialog>
          <DeleteConfirmationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDelete}
            title="Delete Transaction"
            description="Are you sure you want to delete this transaction? This action cannot be undone."
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
