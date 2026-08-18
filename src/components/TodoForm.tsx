"use client";

import { useState } from "react";
import type { Todo } from "@/types/todo";

interface NewTodoInput {
  title: string;
}

interface EditTodoInput {
  title: string;
  recipient?: string;
  amount?: number;
  bank?: string;
  accountNumber?: string;
}

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: NewTodoInput | EditTodoInput) => void;
  onClose: () => void;
}

export default function TodoForm({ todo, onSubmit, onClose }: TodoFormProps) {
  const isEdit = Boolean(todo);
  const isPayment = todo?.type === "payment";

  const [title, setTitle] = useState(todo?.title ?? "");
  const [recipient, setRecipient] = useState(todo?.recipient ?? "");
  const [amount, setAmount] = useState(todo?.amount?.toString() ?? "");
  const [bank, setBank] = useState(todo?.bank ?? "");
  const [accountNumber, setAccountNumber] = useState(todo?.accountNumber ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isPayment) {
      onSubmit({
        title: title.trim(),
        recipient: recipient.trim(),
        amount: Number(amount) || 0,
        bank: bank.trim(),
        accountNumber: accountNumber.trim(),
      });
    } else {
      onSubmit({ title: title.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-t-2xl bg-white p-6 sm:rounded-2xl"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {isEdit ? "할일 수정" : "할일 추가"}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할일 제목"
            className="w-full rounded-xl border border-border px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />

          {isPayment && (
            <>
              <input
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
            </>
          )}
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
      </form>
    </div>
  );
}
