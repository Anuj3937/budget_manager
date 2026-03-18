"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PiggyBank, BrainCircuit, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";
import { doc, collection, serverTimestamp } from "firebase/firestore";

import {
  useFirestore,
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Category, Budget } from "@/lib/types";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const allocationSchema = z.object({
  totalIncome: z.coerce
    .number()
    .positive({ message: "Income must be a positive number." })
    .optional(),
  allocations: z.array(
    z.object({
      categoryId: z.string(),
      categoryName: z.string(),
      percentage: z.coerce.number().min(0).max(100).optional(),
    })
  ),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

interface IncomeAllocatorProps {
  categories: Category[];
  budgets: Budget[];
}

export default function IncomeAllocator({
  categories,
  budgets,
}: IncomeAllocatorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      totalIncome: undefined,
      allocations: expenseCategories.map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        percentage: 0,
      })),
    },
  });

  useEffect(() => {
    form.reset({
      totalIncome: form.getValues('totalIncome'),
      allocations: expenseCategories.map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        percentage: 0,
      })),
    });
  }, [categories, form, expenseCategories]);
  
  const { fields } = form.control.register("allocations");
  const watchAllocations = form.watch("allocations");
  const watchTotalIncome = form.watch("totalIncome");

  const totalPercentage = useMemo(() => {
    return watchAllocations.reduce(
      (acc, curr) => acc + (curr.percentage || 0),
      0
    );
  }, [watchAllocations]);

  async function onSubmit(data: AllocationFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to manage budgets.",
      });
      return;
    }

    if (!data.totalIncome) {
        toast({
            variant: "destructive",
            title: "Missing Income",
            description: "Please enter a total income amount.",
        });
        return;
    }

    setIsSubmitting(true);

    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const allocationPromises = data.allocations
      .filter((alloc) => (alloc.percentage || 0) > 0)
      .map(async (alloc) => {
        const limitAmount = (data.totalIncome! * (alloc.percentage || 0)) / 100;

        const existingBudget = budgets.find(
          (b) =>
            b.categoryId === alloc.categoryId &&
            new Date(b.startDate as any) >= monthStart &&
            new Date(b.endDate as any) <= monthEnd
        );

        if (existingBudget) {
          const budgetRef = doc(
            firestore,
            `users/${user.uid}/budgets/${existingBudget.id}`
          );
          updateDocumentNonBlocking(budgetRef, {
            limitAmount,
            updatedAt: serverTimestamp(),
          });
        } else {
          const budgetsColRef = collection(firestore, `users/${user.uid}/budgets`);
          addDocumentNonBlocking(budgetsColRef, {
            userId: user.uid,
            categoryId: alloc.categoryId,
            categoryName: alloc.categoryName,
            limitAmount,
            startDate: monthStart,
            endDate: monthEnd,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      });

    try {
      await Promise.all(allocationPromises);
      toast({
        title: "Budgets Updated!",
        description: "Your new budget allocations have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not save your budget allocations.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Income Allocator
        </CardTitle>
        <CardDescription>
          Set budgets based on a percentage of your income.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalIncome">Monthly Income</Label>
            <Input
              id="totalIncome"
              type="number"
              placeholder="e.g., 3000"
              {...form.register("totalIncome")}
            />
             {form.formState.errors.totalIncome && (
                <p className="text-sm text-destructive">{form.formState.errors.totalIncome.message}</p>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            <h4 className="text-sm font-medium">Expense Categories</h4>
            {form.getValues('allocations').map((field, index) => {
              const allocatedAmount =
                ((watchTotalIncome || 0) *
                  (watchAllocations[index]?.percentage || 0)) /
                100;
              return (
                <div key={index} className="space-y-2">
                  <Label>{field.categoryName}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="%"
                      className="w-20"
                      {...form.register(`allocations.${index}.percentage`)}
                    />
                    <div className="flex-1 text-sm text-muted-foreground rounded-md border border-input bg-background px-3 py-2">
                       {formatCurrency(allocatedAmount)}
                    </div>
                  </div>
                </div>
              );
            })}
             {expenseCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">No expense categories found. Add some on the Categories page to start allocating.</p>
             )}
          </div>
            
          <div className="space-y-1 pt-2">
            <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium">Total Allocated</p>
                <p className={cn("text-sm font-semibold", totalPercentage > 100 ? "text-destructive" : "text-muted-foreground")}>
                    {totalPercentage.toFixed(0)}%
                </p>
            </div>
            {totalPercentage > 100 && (
                <p className="text-xs text-destructive text-center">Total allocation cannot exceed 100%.</p>
            )}
          </div>


          <Button type="submit" disabled={isSubmitting || totalPercentage > 100 || expenseCategories.length === 0} className="w-full">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Updating..." : "Update Budgets"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
