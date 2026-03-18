"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy } from "firebase/firestore";
import { PlusCircle, Loader2 } from "lucide-react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/layout/header";
import { categoryColumns } from "@/components/categories/columns";
import { DataTable } from "@/components/shared/data-table";
import { ManageCategoryDialog } from "@/components/categories/manage-category-dialog";

export default function CategoriesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/categories`), orderBy("name"));
  }, [firestore, user]);

  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || categoriesLoading || !user) {
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
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your income and expense categories.</CardDescription>
            </div>
            <ManageCategoryDialog>
              <Button>
                <PlusCircle className="mr-2" />
                Add Category
              </Button>
            </ManageCategoryDialog>
          </CardHeader>
          <CardContent>
            <DataTable columns={categoryColumns} data={categories || []} filterColumn="name" />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
