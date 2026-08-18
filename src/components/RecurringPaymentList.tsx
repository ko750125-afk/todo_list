import type { RecurringPayment } from "@/types/recurringPayment";
import { formatCurrency } from "@/utils/format";

interface RecurringPaymentListProps {
  payments: RecurringPayment[];
  onSelect: (payment: RecurringPayment) => void;
}

export default function RecurringPaymentList({
  payments,
  onSelect,
}: RecurringPaymentListProps) {
  return (
    <div className="divide-y divide-border">
      {payments.map((payment) => (
        <button
          key={payment.id}
          type="button"
          onClick={() => onSelect(payment)}
          className="flex w-full flex-col gap-1 py-4 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-foreground">
              {payment.recipient}
            </span>
            <span className="text-base text-foreground">
              {formatCurrency(payment.amount)}
            </span>
          </div>
          <div className="text-sm text-muted">
            {payment.bank} {payment.accountNumber} · 매월 {payment.paymentDay}일
          </div>
        </button>
      ))}
    </div>
  );
}
