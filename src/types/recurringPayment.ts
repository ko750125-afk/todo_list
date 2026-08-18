import type { Timestamp } from "firebase/firestore";

export interface RecurringPayment {
  id: string;
  recipient: string;
  amount: number;
  bank: string;
  accountNumber: string;
  paymentDay: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
