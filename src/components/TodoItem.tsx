import { useState } from "react";
import { Copy, Check, Trash2, Calendar, GripVertical } from "lucide-react";
import type { Todo } from "@/types/todo";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onCopyAccount: (accountNumber: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export default function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onCopyAccount,
  draggable = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}: TodoItemProps) {
  const isPayment = todo.type === "payment";
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo.accountNumber) {
      onCopyAccount(todo.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      draggable={draggable && !todo.completed}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 ${
        isDragging
          ? "opacity-30 scale-[0.98] border-dashed border-emerald-500 ring-2 ring-emerald-400/40"
          : isDragOver
          ? "border-emerald-500 bg-emerald-100/50 ring-2 ring-emerald-500/50 shadow-md"
          : todo.completed
          ? "border-border/40 bg-muted/20 opacity-60"
          : "border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-lime-50/50 dark:from-emerald-950/30 dark:via-card dark:to-lime-950/20 shadow-xs hover:border-emerald-400 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* 드래그 핸들 (미완료 시에만 표시) */}
        {!todo.completed && draggable && (
          <div
            title="드래그하여 순서 변경"
            className="mt-0.5 -ml-1 flex h-6 items-center justify-center text-emerald-300 hover:text-emerald-700 dark:text-emerald-700 dark:hover:text-emerald-300 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
          >
            <GripVertical className="size-4" />
          </div>
        )}

        {/* 체크 버튼 */}
        <button
          type="button"
          aria-label={todo.completed ? "완료 취소" : "완료 처리"}
          onClick={() => onToggle(todo)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            todo.completed
              ? "border-emerald-600 bg-emerald-600 text-white scale-95"
              : "border-emerald-400 hover:border-emerald-600 bg-background"
          }`}
        >
          {todo.completed && <Check className="size-3.5 stroke-[3]" />}
        </button>

        {/* 메인 내용 영역 (클릭 편집 제거) */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            {isPayment && (
              /* 입금일 뱃지: 싱그러운 연두색 뱃지 */
              <Badge
                variant="outline"
                className="shrink-0 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-lg border-emerald-300 dark:border-emerald-700 flex items-center gap-1"
              >
                <Calendar className="size-3.5 text-emerald-700 dark:text-emerald-400" />
                {todo.month && todo.paymentDay
                  ? `${todo.month}월 ${todo.paymentDay}일 입금`
                  : todo.paymentDay
                  ? `매월 ${todo.paymentDay}일 입금`
                  : todo.month
                  ? `${todo.month}월 입금`
                  : "입금"}
              </Badge>
            )}
            <span
              className={`text-base font-semibold break-keep leading-snug ${
                todo.completed
                  ? "text-muted-foreground line-through decoration-slate-400 font-normal"
                  : "text-emerald-950 dark:text-emerald-50"
              }`}
            >
              {todo.title}
            </span>
          </div>

          {/* 입금 세부정보 영역 */}
          {isPayment && (
            <div className="mt-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl bg-white/90 dark:bg-card/90 p-2.5 border border-emerald-200/70 dark:border-emerald-900/50 shadow-2xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground font-semibold">송금액</span>
                  <span
                    className={`text-lg font-extrabold ${
                      todo.completed ? "text-muted-foreground" : "text-emerald-700 dark:text-emerald-400 font-mono"
                    }`}
                  >
                    {formatCurrency(todo.amount ?? 0)}
                  </span>
                </div>
              </div>

              {/* 계좌번호 복사 칩 */}
              {todo.bank && todo.accountNumber && (
                <div
                  onClick={handleCopy}
                  className="flex items-center justify-between rounded-xl bg-white/90 dark:bg-card/90 border border-emerald-200/70 dark:border-emerald-900/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50/80 active:scale-[0.99] transition-all cursor-pointer group/chip"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-foreground">{todo.bank}</span>
                    <span className="font-mono text-muted-foreground">{todo.accountNumber}</span>
                    {todo.recipient && (
                      <span className="text-muted-foreground">({todo.recipient})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2 font-semibold text-emerald-700 dark:text-emerald-400 text-[11px]">
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted-foreground group-hover/chip:text-emerald-700 transition-colors" />
                        <span>복사</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 (삭제만 유지) */}
        <div className="flex items-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="삭제"
            onClick={() => onDelete(todo)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

