import { Calendar, Building2, Plus } from "lucide-react";
import type { RecurringPayment } from "@/types/recurringPayment";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecurringPaymentListProps {
  payments: RecurringPayment[];
  onSelect: (payment: RecurringPayment) => void;
  onAddToTodo?: (payment: RecurringPayment) => void;
}

export default function RecurringPaymentList({
  payments,
  onSelect,
  onAddToTodo,
}: RecurringPaymentListProps) {
  // 매월 입금일 순으로 정렬 (1일 -> 31일)
  const sortedPayments = [...payments].sort((a, b) => a.paymentDay - b.paymentDay);

  return (
    <div className="flex flex-col gap-2.5">
      {sortedPayments.map((payment) => (
        <div
          key={payment.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(payment)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(payment);
            }
          }}
          className="group relative flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs hover:border-zinc-900 dark:hover:border-zinc-400 hover:shadow-sm transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <Building2 className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {payment.recipient}
                </span>
                <Badge
                  variant="outline"
                  className="bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200 text-xs px-2 py-0.5 rounded-lg border-zinc-300 dark:border-zinc-700"
                >
                  <Calendar className="size-3 mr-1 inline text-zinc-600 dark:text-zinc-400" />
                  매월 {payment.paymentDay}일
                </Badge>
              </div>

              {(payment.bank || payment.accountNumber) && (
                <div className="mt-1 text-xs text-zinc-500 font-medium truncate">
                  {payment.bank} <span className="font-mono">{payment.accountNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            <div className="text-right">
              <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                {formatCurrency(payment.amount)}
              </div>
            </div>

            {onAddToTodo && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="투두리스트에 지금 올리기"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToTodo(payment);
                }}
                className="h-9 px-3 rounded-xl text-xs font-semibold border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-2xs flex items-center gap-1 shrink-0"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>투두 올리기</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


