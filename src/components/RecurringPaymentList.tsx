import { Calendar, Building2, ChevronRight } from "lucide-react";
import type { RecurringPayment } from "@/types/recurringPayment";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

interface RecurringPaymentListProps {
  payments: RecurringPayment[];
  onSelect: (payment: RecurringPayment) => void;
}

export default function RecurringPaymentList({
  payments,
  onSelect,
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
          className="group relative flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 cursor-pointer text-left"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-primary border border-blue-100 dark:border-blue-900/40">
              <Building2 className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-foreground">
                  {payment.recipient}
                </span>
                <Badge
                  variant="outline"
                  className="bg-slate-50 dark:bg-muted font-semibold text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-lg border-slate-200/80"
                >
                  <Calendar className="size-3 mr-1 inline text-primary" />
                  매월 {payment.paymentDay}일
                </Badge>
              </div>

              {(payment.bank || payment.accountNumber) && (
                <div className="mt-1 text-xs text-muted-foreground font-medium truncate">
                  {payment.bank} <span className="font-mono">{payment.accountNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <div className="text-right">
              <div className="text-base font-extrabold text-foreground">
                {formatCurrency(payment.amount)}
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      ))}
    </div>
  );
}


