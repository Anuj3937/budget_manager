"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { doc, serverTimestamp, collection } from "firebase/firestore";

import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a category type.",
  }),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface ManageCategoryDialogProps {
  children: ReactNode;
  category?: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManageCategoryDialog({
  children,
  category,
  open,
  onOpenChange,
}: ManageCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const isEditing = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: isEditing ? category : { type: "expense", name: "", description: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: CategoryFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to manage categories.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const docRef = doc(firestore, `users/${user.uid}/categories/${category.id}`);
        updateDocumentNonBlocking(docRef, { ...data, updatedAt: serverTimestamp() });
        toast({ title: "Category Updated" });
      } else {
        const collectionRef = collection(firestore, `users/${user.uid}/categories`);
        addDocumentNonBlocking(collectionRef, {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Category Created" });
      }

      if (onOpenChange) onOpenChange(false);
      else setInternalOpen(false);
      
      form.reset(isEditing ? data : { type: "expense", name: "", description: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not save category.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open ?? internalOpen} onOpenChange={onOpenChange ?? setInternalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your category."
              : "Enter the details of your new category below."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Income</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional: A short description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
