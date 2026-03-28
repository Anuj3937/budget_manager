"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doc } from "firebase/firestore";
import { useFirestore, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { Budget, Category } from "@/lib/types";
import { format } from "date-fns";
import { ManageBudgetDialog } from "./manage-budget-dialog";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

import { useCurrency } from '@/hooks/use-currency';

export const budgetColumns = (categories: Category[]): ColumnDef<Budget>[] => [
  {
    accessorKey: "categoryName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "limitAmount",
    header: () => <div className="text-right">Limit</div>,
    cell: function LimitCell({ row }) {
      const { format: formatCurrency } = useCurrency();
      const amount = parseFloat(row.getValue("limitAmount"));
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.getValue("startDate") as any), "PPP"),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.getValue("endDate") as any), "PPP"),
  },
  {
    id: "actions",
    cell: function Actions({ row }) {
      const budget = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const firestore = useFirestore();
      const { user } = useUser();
      const { toast } = useToast();

      const handleDelete = () => {
        if (!user) return;
        const docRef = doc(firestore, `users/${user.uid}/budgets/${budget.id}`);
        deleteDocumentNonBlocking(docRef);
        toast({ title: "Budget deleted successfully." });
        setIsDeleteOpen(false);
      };

      return (
        <>
          <ManageBudgetDialog
            budget={budget}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            categories={categories}
          >
            <span />
          </ManageBudgetDialog>
          <DeleteConfirmationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDelete}
            title="Delete Budget"
            description="Are you sure you want to delete this budget? This action cannot be undone."
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
