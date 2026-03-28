"use client";

import { useState } from "react";
import { collection, doc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { Users, Settings, PlusCircle, Shield, User as UserIcon, Check, X, Coins } from "lucide-react";
import {
  useFirestore,
  useUser,
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { SharedWallet, WalletMember, WalletTransaction } from "@/lib/types";
import { formatCurrency } from "@/lib/rule-engine";

interface ManageWalletDialogProps {
  wallet: SharedWallet;
  children: React.ReactNode;
}

// Mock users mapping for demo purposes since we don't have a full User collection hook handy
const mockUserMap: Record<string, { email: string; name: string }> = {
  // We'll populate this with the current user's UID to show them properly
};

export function ManageWalletDialog({ wallet, children }: ManageWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const isAdmin = wallet.ownerUserId === user?.uid || wallet.members.find(m => m.userId === user?.uid)?.role === 'admin';

  // Local state for mocked transactions for the UI
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: "mock1",
      walletId: wallet.id,
      userId: "mock-child-uid",
      amount: 1500,
      type: "expense",
      categoryId: "cat1",
      categoryName: "Gaming",
      notes: "New game purchase",
      status: "pending",
      transactionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const [allowanceInput, setAllowanceInput] = useState<Record<string, string>>({});

  if (user) {
     mockUserMap[user.uid] = { email: user.email || 'you@example.com', name: 'You' };
     mockUserMap["mock-child-uid"] = { email: "child@family.com", name: "Child Account" };
  }

  // To truly handle this, the owner's app instance must update the shared wallet doc
  const handleUpdateRole = (memberId: string, newRole: 'admin' | 'member') => {
    if (!isAdmin || !user) return;
    const updatedMembers = wallet.members.map(m => 
      m.userId === memberId ? { ...m, role: newRole } : m
    );
    
    // In a real app with subcollections, we'd update the specific member. 
    // Here we update the embedded array.
    const docRef = doc(firestore, `users/${wallet.ownerUserId}/sharedWallets/${wallet.id}`);
    updateDocumentNonBlocking(docRef, { members: updatedMembers, updatedAt: serverTimestamp() });
    toast({ title: "Role updated" });
  };

  const handleUpdateAllowance = (memberId: string) => {
    if (!isAdmin || !user) return;
    const amount = Number(allowanceInput[memberId]);
    if (isNaN(amount) || amount < 0) return;

    const updatedMembers = wallet.members.map(m => 
      m.userId === memberId ? { ...m, allowance: amount } : m
    );
    
    const docRef = doc(firestore, `users/${wallet.ownerUserId}/sharedWallets/${wallet.id}`);
    updateDocumentNonBlocking(docRef, { members: updatedMembers, updatedAt: serverTimestamp() });
    toast({ title: "Allowance updated", description: `Set to ${formatCurrency(amount, 'en-IN', 'INR')}` });
  };

  const handleTransactionApproval = (txnId: string, newStatus: 'approved' | 'rejected') => {
    setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: newStatus } : t));
    toast({ 
      title: newStatus === 'approved' ? "Transaction Approved" : "Transaction Rejected",
      variant: newStatus === 'rejected' ? 'destructive' : 'default'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Manage: {wallet.name}
          </DialogTitle>
          <DialogDescription>
            Administer family members, set allowances, and approve pending expenses.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 shrink-0">
            <TabsList className="w-full grid content-around grid-cols-2">
              <TabsTrigger value="members">Members & Allowances</TabsTrigger>
              <TabsTrigger value="approvals">
                Approvals 
                {transactions.filter(t => t.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 rounded-full flex items-center justify-center">
                    {transactions.filter(t => t.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Family Members
              </h4>
              <Badge variant="outline" className="font-mono bg-muted/50">Invite: {wallet.inviteCode}</Badge>
            </div>

            <div className="space-y-3">
              {wallet.members?.map((member) => {
                const isMe = member.userId === user?.uid;
                const memberProfile = mockUserMap[member.userId] || { name: "Pending User", email: member.userId };
                
                return (
                  <Card key={member.userId}>
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                           {member.role === 'admin' ? <Shield className="h-5 w-5 text-primary" /> : <UserIcon className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2">
                            {memberProfile.name} {isMe && <Badge variant="secondary" className="text-[10px]">You</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">{memberProfile.email}</p>
                        </div>
                      </div>

                      {isAdmin && !isMe ? (
                         <div className="flex flex-col gap-2 w-full sm:w-auto">
                           <div className="flex items-center gap-2">
                             <Label className="text-xs w-16">Allowance</Label>
                             <Input 
                               type="number" 
                               placeholder={member.allowance?.toString() || "0"} 
                               className="h-8 w-24 text-sm"
                               value={allowanceInput[member.userId] !== undefined ? allowanceInput[member.userId] : (member.allowance || '')}
                               onChange={(e) => setAllowanceInput(prev => ({...prev, [member.userId]: e.target.value}))}
                             />
                             <Button size="sm" variant="secondary" onClick={() => handleUpdateAllowance(member.userId)}>Set</Button>
                           </div>
                           <div className="flex justify-end gap-2 mt-1">
                              {member.role === 'admin' ? (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateRole(member.userId, 'member')}>
                                  Demote to Member
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateRole(member.userId, 'admin')}>
                                  Promote to Admin
                                </Button>
                              )}
                           </div>
                         </div>
                      ) : (
                         <div className="text-right">
                           <Badge variant={member.role === 'admin' ? "default" : "secondary"}>
                             {member.role === 'admin' ? 'Admin' : 'Member'}
                           </Badge>
                           {member.allowance !== undefined && (
                             <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1 justify-end">
                               <Coins className="h-3 w-3" /> {formatCurrency(member.allowance, 'en-IN', 'INR')} / mo
                             </p>
                           )}
                         </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Mocking adding a child for demo */}
              {isAdmin && wallet.members.length === 1 && (
                <Button variant="outline" className="w-full h-20 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors bg-transparent border-2 border-dashed" onClick={() => {
                   const docRef = doc(firestore, `users/${wallet.ownerUserId}/sharedWallets/${wallet.id}`);
                   updateDocumentNonBlocking(docRef, { 
                     members: [...wallet.members, { userId: "mock-child-uid", role: "member", allowance: 5000, joinedAt: serverTimestamp() }]
                   });
                }}>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Simulate Child Joining via Invite Code
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="flex-1 overflow-y-auto p-6 pt-4">
             {transactions.filter(t => t.status === 'pending').length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                 <Check className="h-12 w-12 mb-4 opacity-20 text-green-500" />
                 <p className="font-semibold">All caught up!</p>
                 <p className="text-sm">No expenses require approval.</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {transactions.filter(t => t.status === 'pending').map(txn => {
                    const requester = mockUserMap[txn.userId] || { name: 'Unknown Member' };
                    return (
                      <Card key={txn.id} className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10">Needs Approval</Badge>
                              <span className="text-xs text-muted-foreground">{requester.name}</span>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(txn.amount, 'en-IN', 'INR')}</p>
                            <p className="text-sm font-medium">{txn.categoryName}</p>
                            {txn.notes && <p className="text-xs text-muted-foreground mt-1 italic">&quot;{txn.notes}&quot;</p>}
                          </div>
                          
                          {isAdmin ? (
                            <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                              <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleTransactionApproval(txn.id, 'rejected')}>
                                <X className="h-4 w-4 mr-1" /> Deny
                              </Button>
                              <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white" onClick={() => handleTransactionApproval(txn.id, 'approved')}>
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Waiting for Admin</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
               </div>
             )}

             {/* Approved History */}
             {transactions.filter(t => t.status !== 'pending').length > 0 && (
               <div className="mt-8">
                 <h4 className="font-semibold text-sm text-muted-foreground mb-3">Recent Approvals</h4>
                 <div className="space-y-2 opacity-70">
                   {transactions.filter(t => t.status !== 'pending').map(txn => (
                     <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-card border text-sm">
                       <div>
                         <p className="font-medium">{txn.categoryName}</p>
                         <p className="text-xs text-muted-foreground">{mockUserMap[txn.userId]?.name || 'Unknown'}</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold">{formatCurrency(txn.amount, 'en-IN', 'INR')}</p>
                         <Badge variant={txn.status === 'approved' ? 'default' : 'destructive'} className="text-[10px]">
                           {txn.status}
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
