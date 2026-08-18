import type { Timestamp } from "firebase/firestore";

export type TodoType = "normal" | "payment";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  type: TodoType;
  dueDate?: string; // YYYY-MM-DD 형식 (선택 사항)
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



