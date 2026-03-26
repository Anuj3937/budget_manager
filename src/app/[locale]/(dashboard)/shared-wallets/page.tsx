"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import {
  Users,
  PlusCircle,
  Copy,
  Loader2,
  Trash2,
  UserPlus,
  Wallet,
  Share2,
} from "lucide-react";

import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import type { SharedWallet } from "@/lib/types";

const walletSchema = z.object({
  name: z.string().min(1, "Wallet name is required.").max(50),
});

type WalletFormValues = z.infer<typeof walletSchema>;

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function SharedWalletsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const walletsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/sharedWallets`);
  }, [firestore, user]);

  const { data: wallets, isLoading } = useCollection<SharedWallet>(walletsQuery);

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(data: WalletFormValues) {
    if (!user) return;

    const colRef = collection(firestore, `users/${user.uid}/sharedWallets`);
    addDocumentNonBlocking(colRef, {
      name: data.name,
      ownerUserId: user.uid,
      memberUserIds: [user.uid],
      inviteCode: generateInviteCode(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    toast({ title: "🎉 Wallet Created!", description: `"${data.name}" is ready for your squad.` });
    form.reset();
    setCreateOpen(false);
  }

  function handleDelete(walletId: string) {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/sharedWallets/${walletId}`);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Wallet Deleted" });
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast({ title: "Invite Code Copied!", description: `Share "${code}" with your partner or roommate.` });
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Shared Wallets
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage shared expenses with your partner, roommates, or family.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Create Shared Wallet</DialogTitle>
                <DialogDescription>
                  Create a wallet and share the invite code with your squad.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Name</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g., "Apartment Expenses"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                      <Wallet className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Wallets Grid */}
        {wallets && wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="group hover:border-primary/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      {wallet.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(wallet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    {wallet.memberUserIds?.length || 1} member{(wallet.memberUserIds?.length || 1) > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Share2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono flex-1">{wallet.inviteCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => handleCopyCode(wallet.inviteCode)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Owner: You
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No shared wallets yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a wallet and invite your partner or roommates to track shared expenses together.
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
