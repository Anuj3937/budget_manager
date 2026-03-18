"use client";

import { useState } from "react";
import { ArrowRight, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { ManageTransactionDialog } from "@/components/dashboard/manage-transaction-dialog";

interface SuggestedCategory {
  name: string;
  type: 'expense' | 'income';
  color?: string;
  icon?: string;
}

type SuggestedCategoriesOutput = SuggestedCategory[];

const DEFAULT_CATEGORIES: SuggestedCategoriesOutput = [
  { name: "Housing", type: "expense" },
  { name: "Food", type: "expense" },
  { name: "Transportation", type: "expense" },
  { name: "Utilities", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Salary", type: "income" },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [suggested, setSuggested] = useState<SuggestedCategoriesOutput>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSuggestCategories = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading
      setSuggested(DEFAULT_CATEGORIES);
      setSelectedCategories(DEFAULT_CATEGORIES.map(c => c.name)); // Pre-select all
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not load categories." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategories = async () => {
    if (!user) return;
    setIsLoading(true);
    const toAdd = suggested.filter(c => selectedCategories.includes(c.name));
    
    const collectionRef = collection(firestore, `users/${user.uid}/categories`);
    const promises = toAdd.map(category => {
      return addDocumentNonBlocking(collectionRef, {
        ...category,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    try {
      // The useCollection hook will automatically update, no need to await here
      promises.forEach(p => p.catch(console.error));
      toast({ title: "Categories Added!", description: "Your new categories have been saved." });
      setStep(3);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not save categories." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex h-full flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-center text-3xl">Welcome to Horizon!</CardTitle>
              <CardDescription className="text-center">Let's get your financial dashboard set up in just a few moments.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" onClick={() => setStep(2)}>
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>1. Setup Your Categories</CardTitle>
              <CardDescription>Categories help you organize your spending. Let's start with some common ones, or add your own later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggested.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                    {suggested.map(cat => (
                      <div key={cat.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={cat.name}
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={() => handleToggleCategory(cat.name)}
                        />
                        <label htmlFor={cat.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {cat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAddCategories} disabled={isLoading || selectedCategories.length === 0} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                    Add {selectedCategories.length} Categories & Continue
                  </Button>
                </div>
              ) : (
                <Button onClick={handleSuggestCategories} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                  Load Default Categories
                </Button>
              )}
              <Button variant="link" className="w-full" onClick={() => setStep(3)}>I'll add categories later</Button>
            </CardContent>
          </>
        )}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>2. Add Your First Transaction</CardTitle>
              <CardDescription>Log an income or an expense to start seeing your dashboard come to life.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
               <ManageTransactionDialog>
                    <Button size="lg">Add a Transaction</Button>
               </ManageTransactionDialog>
               <Button variant="link" onClick={() => setStep(4)}>I'll do this later</Button>
            </CardContent>
          </>
        )}
        {step === 4 && (
          <>
            <CardHeader className="items-center">
                <PartyPopper className="h-16 w-16 text-primary" />
                <CardTitle className="text-center text-3xl">You're All Set!</CardTitle>
                <CardDescription className="text-center">Your dashboard is now ready. As you add more data, your insights will grow.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-sm text-muted-foreground">The page will update automatically when you add data.</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
