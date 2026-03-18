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
import { Badge } from "@/components/ui/badge";
import { doc } from "firebase/firestore";
import { useFirestore, useUser, deleteDocumentNonBlocking } from "@/firebase";
import { Category } from "@/lib/types";
import { ManageCategoryDialog } from "./manage-category-dialog";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as "income" | "expense";
      return (
        <Badge
          className={cn(
            type === "income" ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500",
            "border-none"
          )}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: function Actions({ row }) {
      const category = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const firestore = useFirestore();
      const { user } = useUser();
      const { toast } = useToast();

      const handleDelete = () => {
        if (!user) return;
        const docRef = doc(firestore, `users/${user.uid}/categories/${category.id}`);
        deleteDocumentNonBlocking(docRef);
        toast({ title: "Category deleted successfully." });
        setIsDeleteOpen(false);
      };

      return (
        <>
          <ManageCategoryDialog
            category={category}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          >
            <span />
          </ManageCategoryDialog>
          <DeleteConfirmationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDelete}
            title="Delete Category"
            description="Are you sure you want to delete this category? This will also affect transactions associated with it."
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
