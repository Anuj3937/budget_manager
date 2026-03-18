"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query } from "firebase/firestore";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import type { Budget, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/layout/header";
import { budgetColumns } from "@/components/budgets/columns";
import { DataTable } from "@/components/shared/data-table";
import { ManageBudgetDialog } from "@/components/budgets/manage-budget-dialog";

export default function BudgetsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [firestore, user]);

  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);

  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || budgetsLoading || categoriesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budgets</CardTitle>
              <CardDescription>Manage your monthly budgets.</CardDescription>
            </div>
            <ManageBudgetDialog categories={categories || []}>
              <Button>
                <PlusCircle className="mr-2" />
                Add Budget
              </Button>
            </ManageBudgetDialog>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={budgetColumns(categories || [])} 
              data={budgets || []}
              filterColumn="categoryName"
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
