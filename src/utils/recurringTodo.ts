import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db, TODOS_COLLECTION, RECURRING_PAYMENTS_COLLECTION } from "@/lib/firebase";
import type { RecurringPayment } from "@/types/recurringPayment";

interface Occurrence {
  year: number;
  month: number;
  date: Date;
}

function getOccurrenceDate(year: number, month: number, paymentDay: number): Date {
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = Math.min(paymentDay, lastDayOfMonth);
  return new Date(year, month - 1, day);
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const totalMonths = year * 12 + (month - 1) + delta;
  return { year: Math.floor(totalMonths / 12), month: (totalMonths % 12) + 1 };
}

function getCandidateOccurrences(paymentDay: number, today: Date): Occurrence[] {
  const thisMonth = { year: today.getFullYear(), month: today.getMonth() + 1 };
  const nextMonth = addMonths(thisMonth.year, thisMonth.month, 1);

  return [thisMonth, nextMonth].map(({ year, month }) => ({
    year,
    month,
    date: getOccurrenceDate(year, month, paymentDay),
  }));
}

function occurrenceTodoId(paymentId: string, year: number, month: number): string {
  return `recurring_${paymentId}_${year}_${month}`;
}

async function createPaymentTodoIfMissing(
  payment: RecurringPayment,
  occurrence: Occurrence
): Promise<void> {
  const todoId = occurrenceTodoId(payment.id, occurrence.year, occurrence.month);
  const todoRef = doc(db, TODOS_COLLECTION, todoId);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(todoRef);
    if (existing.exists()) {
      const data = existing.data();
      if (data && !data.paymentDay && payment.paymentDay) {
        transaction.update(todoRef, { paymentDay: payment.paymentDay });
      }
      return;
    }

    transaction.set(todoRef, {
      title: `${payment.recipient} 입금`,
      completed: false,
      type: "payment",
      paymentId: payment.id,
      amount: payment.amount,
      bank: payment.bank || "",
      accountNumber: payment.accountNumber || "",
      recipient: payment.recipient,
      year: occurrence.year,
      month: occurrence.month,
      paymentDay: payment.paymentDay,
      createdAt: Timestamp.now(),
    });
  });
}

export async function createManualRecurringTodo(payment: RecurringPayment): Promise<void> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const todoRef = doc(collection(db, TODOS_COLLECTION));
  await setDoc(todoRef, {
    title: `${payment.recipient} 입금`,
    completed: false,
    type: "payment",
    paymentId: payment.id,
    amount: payment.amount,
    bank: payment.bank || "",
    accountNumber: payment.accountNumber || "",
    recipient: payment.recipient,
    year,
    month,
    paymentDay: payment.paymentDay,
    createdAt: Timestamp.now(),
  });
}

export async function generateDueRecurringTodos(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const paymentsSnapshot = await getDocs(
    query(collection(db, RECURRING_PAYMENTS_COLLECTION), where("active", "==", true))
  );

  const payments = paymentsSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as RecurringPayment)
  );

  for (const payment of payments) {
    const candidates = getCandidateOccurrences(payment.paymentDay, today);

    for (const occurrence of candidates) {
      const triggerDate = new Date(occurrence.date);
      triggerDate.setDate(triggerDate.getDate() - 3);

      if (today >= triggerDate) {
        await createPaymentTodoIfMissing(payment, occurrence);
      }
    }
  }
}


