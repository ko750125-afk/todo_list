"use client";

import { useState } from "react";
import type { RecurringPayment } from "@/types/recurringPayment";

export interface RecurringPaymentInput {
  recipient: string;
  amount: number;
  bank: string;
  accountNumber: string;
  paymentDay: number;
}

interface RecurringPaymentFormProps {
  payment?: RecurringPayment;
  onSubmit: (data: RecurringPaymentInput) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function RecurringPaymentForm({
  payment,
  onSubmit,
  onDelete,
  onClose,
}: RecurringPaymentFormProps) {
  const isEdit = Boolean(payment);

  const [recipient, setRecipient] = useState(payment?.recipient ?? "");
  const [amount, setAmount] = useState(payment?.amount?.toString() ?? "");
  const [bank, setBank] = useState(payment?.bank ?? "");
  const [accountNumber, setAccountNumber] = useState(payment?.accountNumber ?? "");
  const [paymentDay, setPaymentDay] = useState(payment?.paymentDay?.toString() ?? "");

  const isValid =
    recipient.trim() && amount && bank.trim() && accountNumber.trim() && paymentDay;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const day = Number(paymentDay);
    if (day < 1 || day > 31) return;

    onSubmit({
      recipient: recipient.trim(),
      amount: Number(amount) || 0,
      bank: bank.trim(),
      accountNumber: accountNumber.trim(),
      paymentDay: day,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-t-2xl bg-white p-6 sm:rounded-2xl"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {isEdit ? "정기입금 수정" : "정기입금 추가"}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="입금처"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="입금액"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="은행"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="계좌번호"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <input
            type="number"
            min={1}
            max={31}
            value={paymentDay}
            onChange={(e) => setPaymentDay(e.target.value)}
            placeholder="매월 입금일 (1~31)"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-base font-medium text-foreground"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-accent py-3 text-base font-medium text-white"
          >
            저장
          </button>
        </div>

        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-4 w-full py-2 text-sm text-muted"
          >
            정기입금 삭제
          </button>
        )}
      </form>
    </div>
  );
}
