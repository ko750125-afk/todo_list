import type { Todo } from "@/types/todo";
import { formatCurrency } from "@/utils/format";

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onCopyAccount: (accountNumber: string) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onCopyAccount,
}: TodoItemProps) {
  const isPayment = todo.type === "payment";

  return (
    <div className="flex items-start gap-3 py-4">
      <button
        type="button"
        aria-label="완료 토글"
        onClick={() => onToggle(todo)}
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border"
        style={todo.completed ? { borderColor: "var(--accent)", background: "var(--accent)" } : undefined}
      >
        {todo.completed && (
          <span className="text-sm font-bold text-white">✓</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onEdit(todo)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-2">
          {isPayment && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-accent">
              입금
            </span>
          )}
          <span
            className={`truncate text-base ${
              todo.completed ? "text-muted line-through" : "text-foreground"
            }`}
          >
            {todo.title}
          </span>
        </div>

        {isPayment && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>{formatCurrency(todo.amount ?? 0)}</span>
            <span>·</span>
            <span>{todo.bank}</span>
            <span>{todo.accountNumber}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                if (todo.accountNumber) onCopyAccount(todo.accountNumber);
              }}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground"
            >
              복사
            </span>
          </div>
        )}
      </button>

      <button
        type="button"
        aria-label="삭제"
        onClick={() => onDelete(todo)}
        className="mt-0.5 shrink-0 px-2 py-1 text-sm text-muted"
      >
        삭제
      </button>
    </div>
  );
}
