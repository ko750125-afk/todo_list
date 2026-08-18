import type { Timestamp } from "firebase/firestore";

export type TodoType = "normal" | "payment";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  type: TodoType;
  paymentId?: string;
  amount?: number;
  bank?: string;
  accountNumber?: string;
  recipient?: string;
  year?: number;
  month?: number;
  paymentDay?: number;
  order?: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}


