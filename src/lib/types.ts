import type { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName?: string;
  transactionDate: Date | Timestamp;
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  limitAmount: number;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  description?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

// ─── Rule-Based Auto-Categorization ───────────────────────────────
export type AutoRule = {
  id: string;
  userId: string;
  /** The keyword or phrase to match against transaction notes */
  keyword: string;
  /** Match strategy: 'contains' | 'startsWith' | 'exact' */
  matchType: 'contains' | 'startsWith' | 'exact';
  /** The category to auto-assign */
  categoryId: string;
  categoryName: string;
  /** Whether the rule is active */
  enabled: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

// ─── Tax Hub ──────────────────────────────────────────────────────
export type TaxProfile = {
  id: string;
  userId: string;
  country: string; // 'IN' | 'US' | etc.
  taxRegime?: 'old' | 'new'; // India-specific
  annualIncome?: number;
  financialYear: string; // e.g., '2025-2026'
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type TaxDeductionMapping = {
  categoryId: string;
  categoryName: string;
  section: string; // e.g., '80C', '80D', 'Standard Deduction'
  maxLimit?: number;
};

// ─── Shared Wallets (Family/Multiplayer Mode) ───────────────────

export type WalletRole = 'admin' | 'member';

export type WalletMember = {
  userId: string;
  role: WalletRole;
  /** Optional monthly allowance (if applicable, e.g., for kids) */
  allowance?: number; 
  joinedAt: Date | Timestamp;
};

export type SharedWallet = {
  id: string;
  name: string;
  ownerUserId: string; // The primary creator
  members: WalletMember[]; // Replace memberUserIds with rich member objects
  /** Invite codes for easy onboarding */
  inviteCode: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type WalletTransaction = {
  id: string;
  walletId: string;
  userId: string; // User who made the transaction
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName?: string;
  transactionDate: Date | Timestamp;
  notes?: string;
  /** Status for admin approvals (e.g., kids expenses > threshold) */
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

