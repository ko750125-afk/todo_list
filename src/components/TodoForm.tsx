"use client";

import { useState } from "react";
import type { Todo } from "@/types/todo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface NewTodoInput {
  title: string;
  dueDate?: string;
}

interface EditTodoInput {
  title: string;
  dueDate?: string;
  recipient?: string;
  amount?: number;
  bank?: string;
  accountNumber?: string;
  paymentDay?: number;
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
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? "");
  const [recipient, setRecipient] = useState(todo?.recipient ?? "");
  const [amount, setAmount] = useState(todo?.amount?.toString() ?? "");
  const [bank, setBank] = useState(todo?.bank ?? "");
  const [accountNumber, setAccountNumber] = useState(todo?.accountNumber ?? "");
  const [paymentDay, setPaymentDay] = useState(todo?.paymentDay?.toString() ?? "");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const getPresetDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().split("T")[0];
  };

  const getWeekendPreset = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7; // 돌아오는 토요일
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isPayment) {
      onSubmit({
        title: title.trim(),
        dueDate: dueDate || undefined,
        recipient: recipient.trim(),
        amount: Number(amount.replace(/,/g, "")) || 0,
        bank: bank.trim(),
        accountNumber: accountNumber.trim(),
        paymentDay: paymentDay ? Number(paymentDay) : undefined,
      });
    } else {
      onSubmit({
        title: title.trim(),
        dueDate: dueDate || undefined,
      });
    }
  };

  const formattedAmountDisplay = amount
    ? Number(amount.replace(/,/g, "")).toLocaleString("ko-KR")
    : "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEdit ? "할일 수정" : "새 할일 등록"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* 할일 내용 */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-title" className="text-xs font-semibold text-muted-foreground">
                할일 내용 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="todo-title"
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 프로젝트 보고서 작성, 공과금 납부"
                onFocus={(e) => { e.target.placeholder = ""; }}
                className="h-12 rounded-xl text-base focus:placeholder-transparent transition-all"
              />
            </div>

            {/* 날짜 / 마감일 (선택) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="todo-due-date" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  📅 날짜 / 마감일 <span className="text-muted-foreground/70 font-normal">(선택)</span>
                </Label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate("")}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
                  >
                    날짜 삭제
                  </button>
                )}
              </div>
              <Input
                id="todo-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 rounded-xl bg-background text-sm cursor-pointer"
              />

              {/* 빠른 날짜 선택 칩 */}
              <div className="flex gap-1.5 mt-0.5">
                <button
                  type="button"
                  onClick={() => setDueDate(getPresetDate(0))}
                  className={`flex-1 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    dueDate === getPresetDate(0)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
                  }`}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(getPresetDate(1))}
                  className={`flex-1 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    dueDate === getPresetDate(1)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
                  }`}
                >
                  내일
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(getWeekendPreset())}
                  className={`flex-1 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    dueDate === getWeekendPreset()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300"
                  }`}
                >
                  이번 주말
                </button>
              </div>
            </div>

            {isPayment && (
              <div className="rounded-2xl bg-slate-50 dark:bg-muted/30 p-4 border border-border/60 flex flex-col gap-3.5">
                <div className="text-xs font-bold text-primary flex items-center gap-1">
                  💳 정기입금 연동 정보
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="todo-recipient" className="text-xs text-muted-foreground">
                    입금처 / 수취인
                  </Label>
                  <Input
                    id="todo-recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="예: 건물주, 관리사무소"
                    className="h-11 rounded-xl bg-background"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="todo-amount" className="text-xs text-muted-foreground">
                      입금액 (원)
                    </Label>
                    {formattedAmountDisplay && (
                      <span className="text-xs font-bold text-primary font-mono">
                        {formattedAmountDisplay}원
                      </span>
                    )}
                  </div>
                  <Input
                    id="todo-amount"
                    type="text"
                    inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString("ko-KR") : ""}
                    onChange={handleAmountChange}
                    placeholder="예: 500,000"
                    className="h-11 rounded-xl bg-background font-mono text-base font-semibold"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label htmlFor="todo-bank" className="text-xs text-muted-foreground">
                      은행
                    </Label>
                    <Input
                      id="todo-bank"
                      type="text"
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      placeholder="국민"
                      className="h-11 rounded-xl bg-background"
                    />
                  </div>
                  <div className="col-span-3 flex flex-col gap-1.5">
                    <Label htmlFor="todo-account-number" className="text-xs text-muted-foreground">
                      계좌번호
                    </Label>
                    <Input
                      id="todo-account-number"
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="'-' 없이 입력 가능"
                      className="h-11 rounded-xl bg-background font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl font-medium"
            >
              취소
            </Button>
            <Button type="submit" className="h-12 flex-1 rounded-xl font-semibold shadow-xs">
              {isEdit ? "수정 완료" : "등록하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

