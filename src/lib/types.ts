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
