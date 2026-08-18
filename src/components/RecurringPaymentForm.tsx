"use client";

import { useState } from "react";
import type { RecurringPayment } from "@/types/recurringPayment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface RecurringPaymentInput {
  recipient: string;
  amount: number;
  bank?: string;
  accountNumber?: string;
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
  const [paymentDay, setPaymentDay] = useState(payment?.paymentDay?.toString() ?? "");
  const [isDayFocused, setIsDayFocused] = useState(false);

  const isValid = recipient.trim() && amount && paymentDay;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const day = Number(paymentDay);
    if (day < 1 || day > 31) return;

    onSubmit({
      recipient: recipient.trim(),
      amount: Number(amount.replace(/,/g, "")) || 0,
      bank: payment?.bank ?? "",
      accountNumber: payment?.accountNumber ?? "",
      paymentDay: day,
    });
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
              {isEdit ? "정기입금 정보 수정" : "새 정기입금 등록"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* 입금처 입력 */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurring-recipient" className="text-xs font-semibold text-muted-foreground">
                입금처 / 수취인 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recurring-recipient"
                autoFocus
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="예: 월세, 부모님 용돈, 적금"
                className="h-12 rounded-xl text-base focus:placeholder-transparent transition-all"
              />
            </div>

            {/* 입금액 입력 */}
            {/* 입금액 입력 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="recurring-amount" className="text-xs font-semibold text-muted-foreground">
                  매월 입금액 (원) <span className="text-destructive">*</span>
                </Label>
                {formattedAmountDisplay && (
                  <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                    {formattedAmountDisplay}원
                  </span>
                )}
              </div>
              <Input
                id="recurring-amount"
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString("ko-KR") : ""}
                onChange={handleAmountChange}
                placeholder="예: 500,000"
                className="h-12 rounded-xl font-mono text-base font-semibold focus:placeholder-transparent transition-all"
              />
            </div>

            {/* 매월 입금일 입력 */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="recurring-payment-day" className="text-xs font-semibold text-muted-foreground">
                매월 입금일 (1~31일) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recurring-payment-day"
                type="text"
                inputMode="numeric"
                value={paymentDay}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  if (val === "" || (Number(val) >= 1 && Number(val) <= 31)) {
                    setPaymentDay(val);
                  }
                }}
                placeholder={isDayFocused ? "" : "예: 25"}
                onFocus={() => setIsDayFocused(true)}
                onBlur={() => setIsDayFocused(false)}
                className="h-12 rounded-xl font-mono text-base focus:placeholder-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl font-medium border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="h-12 flex-1 rounded-xl font-semibold shadow-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {isEdit ? "수정 완료" : "등록하기"}
            </Button>
          </div>

          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              className="h-10 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-xs font-medium"
            >
              정기입금 항목 삭제하기
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}


