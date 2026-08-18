import { useState } from "react";
import { Copy, Check, Trash2, Edit2, ArrowUpRight, Calendar, GripVertical } from "lucide-react";
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
          ? "opacity-30 scale-[0.98] border-dashed border-primary ring-2 ring-primary/40"
          : isDragOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/50 shadow-md"
          : todo.completed
          ? "border-border/40 bg-muted/20 opacity-60"
          : "border-border/80 bg-card shadow-xs hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* 드래그 핸들 (미완료 시에만 표시) */}
        {!todo.completed && draggable && (
          <div
            title="드래그하여 순서 변경"
            className="mt-0.5 -ml-1 flex h-6 items-center justify-center text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
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
              ? "border-primary bg-primary text-primary-foreground scale-95"
              : "border-slate-300 hover:border-primary/80 bg-background"
          }`}
        >
          {todo.completed && <Check className="size-3.5 stroke-[3]" />}
        </button>

        {/* 메인 내용 영역 (클릭 편집 제거) */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            {isPayment && (
              <>
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 font-semibold px-2 py-0.5 text-xs rounded-lg"
                >
                  <ArrowUpRight className="size-3 mr-0.5 inline" />
                  입금
                </Badge>

                {/* 입금일 뱃지: 정확한 날짜 표시 */}
                <Badge
                  variant="outline"
                  className="shrink-0 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs px-2.5 py-0.5 rounded-lg border-blue-300 dark:border-blue-800 flex items-center gap-1"
                >
                  <Calendar className="size-3.5 text-blue-600 dark:text-blue-400" />
                  {todo.month && todo.paymentDay
                    ? `${todo.month}월 ${todo.paymentDay}일 입금`
                    : todo.paymentDay
                    ? `매월 ${todo.paymentDay}일 입금`
                    : todo.month
                    ? `${todo.month}월 입금`
                    : "입금"}
                </Badge>
              </>
            )}
            <span
              className={`text-base font-medium break-keep leading-snug ${
                todo.completed
                  ? "text-muted-foreground line-through decoration-slate-400"
                  : "text-foreground"
              }`}
            >
              {todo.title}
            </span>
          </div>

          {/* 입금 세부정보 영역 */}
          {isPayment && (
            <div className="mt-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-muted/30 p-2.5 border border-border/50">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground font-semibold">송금액</span>
                  <span
                    className={`text-lg font-extrabold ${
                      todo.completed ? "text-muted-foreground" : "text-blue-600 dark:text-blue-400"
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
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200/70 dark:border-border/60 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 active:scale-[0.99] transition-all cursor-pointer group/chip"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-foreground">{todo.bank}</span>
                    <span className="font-mono text-muted-foreground">{todo.accountNumber}</span>
                    {todo.recipient && (
                      <span className="text-muted-foreground">({todo.recipient})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2 font-medium text-primary text-[11px]">
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-muted-foreground group-hover/chip:text-primary transition-colors" />
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

