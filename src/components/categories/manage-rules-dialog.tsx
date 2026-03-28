"use client";

import { useState, type ReactNode, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { Loader2, PlusCircle, Zap, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Category, AutoRule } from "@/lib/types";

const ruleSchema = z.object({
  keyword: z.string().min(1, "Keyword is required."),
  matchType: z.enum(["contains", "startsWith", "exact"]),
  categoryId: z.string().min(1, "Category is required."),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface ManageRulesDialogProps {
  children: ReactNode;
}

export function ManageRulesDialog({ children }: ManageRulesDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);

  const rulesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/autoRules`);
  }, [firestore, user]);

  const { data: categories } = useCollection<Category>(categoriesQuery);
  const { data: rules } = useCollection<AutoRule>(rulesQuery);

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      keyword: "",
      matchType: "contains",
      categoryId: "",
    },
  });

  async function onSubmit(data: RuleFormValues) {
    if (!user) return;

    const selectedCategory = categories?.find((c) => c.id === data.categoryId);
    if (!selectedCategory) return;

    const colRef = collection(firestore, `users/${user.uid}/autoRules`);
    addDocumentNonBlocking(colRef, {
      ...data,
      userId: user.uid,
      categoryName: selectedCategory.name,
      enabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    toast({ title: "⚡ Rule Created", description: `"${data.keyword}" → ${selectedCategory.name}` });
    form.reset();
  }

  function handleDelete(ruleId: string) {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/autoRules/${ruleId}`);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Rule Deleted" });
  }

  function handleToggle(rule: AutoRule) {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/autoRules/${rule.id}`);
    updateDocumentNonBlocking(docRef, {
      enabled: !rule.enabled,
      updatedAt: serverTimestamp(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Auto-Categorization Rules
          </DialogTitle>
          <DialogDescription>
            Create rules to automatically categorize transactions. When a transaction note matches a keyword, it will be categorized instantly.
          </DialogDescription>
        </DialogHeader>

        {/* Existing Rules */}
        {rules && rules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Active Rules</h4>
            {rules.map((rule) => (
              <Card key={rule.id} className={`transition-opacity ${!rule.enabled ? 'opacity-50' : ''}`}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant={rule.enabled ? "default" : "secondary"} className="shrink-0">
                      {rule.matchType}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        &quot;{rule.keyword}&quot; → <span className="text-primary">{rule.categoryName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggle(rule)}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Rule Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground">Add New Rule</h4>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., "Netflix"' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="startsWith">Starts With</SelectItem>
                        <SelectItem value="exact">Exact Match</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-assign to Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
