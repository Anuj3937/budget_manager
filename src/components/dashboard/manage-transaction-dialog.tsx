"use client";

import { useState, type ReactNode, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { collection, serverTimestamp, doc } from "firebase/firestore";

import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking
} from "@/firebase";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Category, Transaction } from "@/lib/types";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a transaction type.",
  }),
  categoryId: z.string().optional().or(z.literal("uncategorized")),
  transactionDate: z.date({
    required_error: "A date is required.",
  }),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface ManageTransactionDialogProps {
  children: ReactNode;
  transaction?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManageTransactionDialog({ children, transaction, open, onOpenChange }: ManageTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditing = !!transaction;

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);

  const { data: categories } = useCollection<Category>(categoriesQuery);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  useEffect(() => {
    if (isEditing && transaction) {
      form.reset({
        ...transaction,
        amount: transaction.amount,
        transactionDate: new Date(transaction.transactionDate as any),
        notes: transaction.notes || "",
      });
    } else {
       form.reset({
        type: "expense",
        transactionDate: new Date(),
        amount: undefined,
        categoryId: undefined,
        notes: "",
      });
    }
  }, [isEditing, transaction, form]);


  const [isSubmitting, setIsSubmitting] = useState(false);

  const transactionType = form.watch("type");

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => c.type === transactionType);
  }, [categories, transactionType]);


  async function onSubmit(data: TransactionFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated", description: "You must be logged in to add a transaction." });
      return;
    }
    setIsSubmitting(true);
    
    const selectedCategory = categories?.find(c => c.id === data.categoryId);
    const finalCategoryName = data.categoryId === "uncategorized" || !data.categoryId ? "Uncategorized" : selectedCategory?.name;

    try {
      if (isEditing) {
        const docRef = doc(firestore, `users/${user.uid}/transactions/${transaction.id}`);
        updateDocumentNonBlocking(docRef, {
            ...data,
            categoryId: data.categoryId === "uncategorized" ? null : data.categoryId,
            categoryName: finalCategoryName,
            updatedAt: serverTimestamp(),
        });
        toast({ title: "Transaction Updated" });
      } else {
        const collectionRef = collection(firestore, `users/${user.uid}/transactions`);
        addDocumentNonBlocking(collectionRef, {
          ...data,
          userId: user.uid,
          categoryId: data.categoryId === "uncategorized" ? null : data.categoryId,
          categoryName: finalCategoryName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Transaction Saved" });
      }
      
      if (onOpenChange) onOpenChange(false);
      else setInternalOpen(false);

      form.reset();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not save transaction.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const currentOpen = open ?? internalOpen;
  const currentOnOpenChange = onOpenChange ?? setInternalOpen;

  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Transaction</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your transaction.' : 'Enter the details of your new transaction below.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('categoryId', '');
                      }}
                      value={field.value}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about the transaction"
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
                Save Transaction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
