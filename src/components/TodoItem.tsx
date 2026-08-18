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
      className={`group relative flex flex-col gap-3 rounded-2xl p-4 transition-all duration-200 ${
        isDragging
          ? "opacity-30 scale-[0.98] border-2 border-dashed border-zinc-900 dark:border-white ring-2 ring-zinc-400/40"
          : isDragOver
          ? "border-2 border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-900/40 dark:ring-white/40 shadow-md"
          : todo.completed
          ? "border border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 opacity-50"
          : "border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* 드래그 핸들 (미완료 시에만 표시) */}
        {!todo.completed && draggable && (
          <div
            title="드래그하여 순서 변경"
            className="mt-0.5 -ml-1 flex h-6 items-center justify-center text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-100 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
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
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 scale-95"
              : "border-zinc-300 hover:border-zinc-900 dark:border-zinc-600 dark:hover:border-white bg-background"
          }`}
        >
          {todo.completed && <Check className="size-3.5 stroke-[3]" />}
        </button>

        {/* 메인 내용 영역 (클릭 편집 제거) */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            {isPayment ? (
              /* 입금일 뱃지: 흑백 투톤 뱃지 */
              <Badge
                variant="outline"
                className="shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs px-2.5 py-0.5 rounded-lg border-zinc-300 dark:border-zinc-700 flex items-center gap-1"
              >
                <Calendar className="size-3.5 text-zinc-700 dark:text-zinc-300" />
                {todo.month && todo.paymentDay
                  ? `${todo.month}월 ${todo.paymentDay}일 입금`
                  : todo.paymentDay
                  ? `매월 ${todo.paymentDay}일 입금`
                  : todo.month
                  ? `${todo.month}월 입금`
                  : "입금"}
              </Badge>
            ) : (
              todo.dueDate && (
                /* 일반 할일 날짜 / 마감일 뱃지 */
                <Badge
                  variant="outline"
                  className="shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs px-2 py-0.5 rounded-lg border-zinc-300 dark:border-zinc-700 flex items-center gap-1"
                >
                  <Calendar className="size-3 text-zinc-600 dark:text-zinc-400" />
                  {(() => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const [y, m, d] = todo.dueDate.split("-").map(Number);
                    if (todo.dueDate === todayStr) return "오늘 마감";
                    return `${m}월 ${d}일`;
                  })()}
                </Badge>
              )
            )}
            <span
              className={`text-base font-semibold break-keep leading-snug ${
                todo.completed
                  ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-400 font-normal"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {todo.title}
            </span>
          </div>

          {/* 입금 세부정보 영역 */}
          {isPayment && (
            <div className="mt-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950/80 p-2.5 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-zinc-500 font-semibold">송금액</span>
                  <span
                    className={`text-lg font-extrabold ${
                      todo.completed ? "text-zinc-400" : "text-zinc-900 dark:text-white font-mono"
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
                  className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all cursor-pointer group/chip"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{todo.bank}</span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{todo.accountNumber}</span>
                    {todo.recipient && (
                      <span className="text-zinc-500">({todo.recipient})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2 font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-zinc-900 dark:text-white" />
                        <span className="text-zinc-900 dark:text-white font-semibold">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-zinc-400 group-hover/chip:text-zinc-900 dark:group-hover/chip:text-white transition-colors" />
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
        <div className="flex items-center shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="삭제"
            onClick={() => onDelete(todo)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

