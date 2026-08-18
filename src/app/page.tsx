"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Plus, CheckCircle2, ListFilter, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { db, TODOS_COLLECTION, RECURRING_PAYMENTS_COLLECTION } from "@/lib/firebase";
import type { Todo } from "@/types/todo";
import type { RecurringPayment } from "@/types/recurringPayment";
import { generateDueRecurringTodos } from "@/utils/recurringTodo";
import { formatCurrency } from "@/utils/format";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "payment" | "normal";

export default function Home() {
  const [rawTodos, setRawTodos] = useState<Todo[] | null>(null);
  const [recurringMap, setRecurringMap] = useState<Map<string, RecurringPayment>>(new Map());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  // 드래그 앤 드롭 상태
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    generateDueRecurringTodos().catch((err) => {
      console.error("정기입금 자동생성 실패", err);
    });
  }, []);

  // 정기입금 원본 데이터 실시간 구독
  useEffect(() => {
    const q = query(collection(db, RECURRING_PAYMENTS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map = new Map<string, RecurringPayment>();
      snapshot.docs.forEach((d) => {
        map.set(d.id, { id: d.id, ...d.data() } as RecurringPayment);
      });
      setRecurringMap(map);
    });
    return unsubscribe;
  }, []);

  // 할일 목록 실시간 구독
  useEffect(() => {
    const q = query(collection(db, TODOS_COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRawTodos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Todo))
      );
    });
    return unsubscribe;
  }, []);

  // paymentDay가 누락된 경우 원본 recurringPayment의 paymentDay로 실시간 보정
  const todos = useMemo(() => {
    if (rawTodos === null) return null;
    return rawTodos.map((t) => {
      if (t.type === "payment" && !t.paymentDay && t.paymentId) {
        const origin = recurringMap.get(t.paymentId);
        if (origin?.paymentDay) {
          return { ...t, paymentDay: origin.paymentDay };
        }
      }
      return t;
    });
  }, [rawTodos, recurringMap]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 전체 통계 계산
  const totalTodosCount = todos?.length ?? 0;
  const incompleteTodos = useMemo(
    () => (todos ?? []).filter((t) => !t.completed),
    [todos]
  );
  const completedTodos = useMemo(
    () => (todos ?? []).filter((t) => t.completed),
    [todos]
  );

  // 이번 달 남은 입금 및 총 입금 계산 (정기입금 원본 기준 + 실시간 남은 입금액)
  const { remainingPaymentTotal, monthlyTotalPayment, completedPaymentTotal } = useMemo(() => {
    // 1. 활성화된 정기입금 원본 총합
    const activeRecurringTotal = Array.from(recurringMap.values())
      .filter((p) => p.active !== false)
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

    // 2. 현재 남아있는 미완료 입금 카드의 총합
    const remaining = (todos ?? [])
      .filter((t) => t.type === "payment" && !t.completed)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    // 정기입금 원본 총합이 있으면 그것을 총액으로 하고, 없으면 남아있는 금액 기준
    const total = activeRecurringTotal > 0 ? activeRecurringTotal : remaining;
    const completed = Math.max(0, total - remaining);

    return {
      monthlyTotalPayment: total,
      remainingPaymentTotal: remaining,
      completedPaymentTotal: completed,
    };
  }, [todos, recurringMap]);

  // 필터링 적용
  const filteredIncomplete = useMemo(() => {
    return incompleteTodos.filter((t) => {
      if (filter === "payment") return t.type === "payment";
      if (filter === "normal") return t.type !== "payment";
      return true;
    });
  }, [incompleteTodos, filter]);

  // 우선순위 정렬 (order 오름차순, 없으면 createdAt 최신순)
  const sortedIncomplete = useMemo(() => {
    return [...filteredIncomplete].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });
  }, [filteredIncomplete]);

  // 완료 목록: 일반 할일만 표시 (입금 카드는 체크 시 완전히 삭제되어 정리됨)
  const filteredCompleted = useMemo(() => {
    return completedTodos.filter((t) => {
      if (filter === "payment") return false;
      return t.type !== "payment";
    });
  }, [completedTodos, filter]);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const items = [...sortedIncomplete];
    const fromIndex = items.findIndex((i) => i.id === draggedId);
    const toIndex = items.findIndex((i) => i.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // 순서 재배치
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);

    // 낙관적 UI 업데이트
    setRawTodos((prev) => {
      if (!prev) return prev;
      const otherItems = prev.filter((p) => p.completed || !items.some((i) => i.id === p.id));
      const updatedMoved = items.map((item, idx) => ({ ...item, order: idx }));
      return [...updatedMoved, ...otherItems];
    });

    setDraggedId(null);
    setDragOverId(null);

    // Firestore batch 업데이트
    try {
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        const ref = doc(db, TODOS_COLLECTION, item.id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
      toast.success("우선순위가 저장되었습니다.");
    } catch (err) {
      console.error("우선순위 저장 실패", err);
      toast.error("우선순위 저장에 실패했습니다.");
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleToggle = async (todo: Todo) => {
    try {
      // 1. 입금 카드의 경우: 체크 즉시 삭제되어 화면에서 깨끗하게 사라짐!
      if (todo.type === "payment") {
        await deleteDoc(doc(db, TODOS_COLLECTION, todo.id));
        toast.success("입금이 완료되어 목록에서 정리되었습니다! 💸");
        return;
      }

      // 2. 일반 할일의 경우: 완료 처리되어 아래 완료 목록으로 이동
      await updateDoc(doc(db, TODOS_COLLECTION, todo.id), {
        completed: !todo.completed,
        completedAt: !todo.completed ? Timestamp.now() : deleteField(),
      });
      if (!todo.completed) {
        toast.success("할일을 완료했습니다! 🎉");
      }
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleAdd = async (data: { title: string }) => {
    try {
      // 새로운 할일은 가장 높은 우선순위 (가장 작은 order)
      const minOrder = (rawTodos ?? []).reduce(
        (min, t) => (t.order !== undefined && t.order < min ? t.order : min),
        0
      );
      await addDoc(collection(db, TODOS_COLLECTION), {
        title: data.title,
        completed: false,
        type: "normal",
        order: minOrder - 1,
        createdAt: Timestamp.now(),
      });
      setShowAddForm(false);
      toast.success("새 할일이 등록되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleEditSave = async (data: {
    title: string;
    recipient?: string;
    amount?: number;
    bank?: string;
    accountNumber?: string;
    paymentDay?: number;
  }) => {
    if (!editingTodo) return;
    try {
      await updateDoc(doc(db, TODOS_COLLECTION, editingTodo.id), { ...data });
      setEditingTodo(null);
      toast.success("수정되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    try {
      await deleteDoc(doc(db, TODOS_COLLECTION, deletingTodo.id));
      setDeletingTodo(null);
      toast.success("할일이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("계좌번호가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("계좌번호 복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 sm:px-6">
      {/* 상단 헤더 & 필터 탭 */}
      <header className="pt-7 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Todo List
          </h1>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-muted text-muted-foreground font-medium">
            {now.toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}
          </span>
        </div>

        {/* 필터 탭 (최상단 배치) */}
        <div className="mt-4 flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-muted/60 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            전체 ({incompleteTodos.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("payment")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
              filter === "payment"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            입금만 ({incompleteTodos.filter((t) => t.type === "payment").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("normal")}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all ${
              filter === "normal"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            일반 할일 ({incompleteTodos.filter((t) => t.type !== "payment").length})
          </button>
        </div>
      </header>

      {/* 메인 목록 영역: 할일 & 입금이 가장 최상단 */}
      <main className="flex-1 pb-6 pt-1">
        {todos === null && (
          <div className="py-16 text-center">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        )}

        {todos !== null && totalTodosCount === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="font-semibold text-foreground">등록된 할일이 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">
              하단 + 버튼을 눌러 새 할일을 추가해 보세요!
            </p>
          </div>
        )}

        {/* 미완료 목록 (최상단 우선 노출) */}
        {todos !== null && totalTodosCount > 0 && (
          <div className="flex flex-col gap-2.5">
            {filteredIncomplete.length === 0 && incompleteTodos.length > 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                선택한 필터 조건에 해당하는 할일이 없습니다.
              </p>
            )}

            {filteredIncomplete.length === 0 && incompleteTodos.length === 0 && (
              <div className="py-10 text-center rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  모든 할일을 완료했습니다!
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                  오늘 하루도 고생 많으셨습니다.
                </p>
              </div>
            )}

            {sortedIncomplete.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                draggable
                onDragStart={() => handleDragStart(todo.id)}
                onDragOver={(e) => handleDragOver(e, todo.id)}
                onDragLeave={() => {
                  if (dragOverId === todo.id) setDragOverId(null);
                }}
                onDrop={(e) => handleDrop(e, todo.id)}
                onDragEnd={handleDragEnd}
                isDragging={draggedId === todo.id}
                isDragOver={dragOverId === todo.id && draggedId !== todo.id}
                onToggle={handleToggle}
                onEdit={setEditingTodo}
                onDelete={setDeletingTodo}
                onCopyAccount={handleCopyAccount}
              />
            ))}
          </div>
        )}

        {/* 이번 달 남은 입금액 대시보드 카드 (연한 하늘색 테마) */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-sky-50 via-sky-100/70 to-blue-100/60 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-sky-900/30 p-5 border border-sky-200/80 dark:border-sky-800/50 shadow-xs">
          <div className="flex items-center justify-between text-sky-900/80 dark:text-sky-200">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="size-4 text-sky-600 dark:text-sky-400" /> 이번 달 남은 입금액
            </span>
            <span className="text-xs bg-sky-200/70 dark:bg-sky-900/70 text-sky-800 dark:text-sky-200 px-2.5 py-0.5 rounded-full font-semibold">
              미완료 {incompleteTodos.length}건
            </span>
          </div>

          <div className="mt-2 text-3xl font-extrabold tracking-tight text-sky-950 dark:text-sky-50 font-mono">
            {formatCurrency(remainingPaymentTotal)}
          </div>

          {/* 진행 바 */}
          {monthlyTotalPayment > 0 && (
            <div className="mt-3.5">
              <div className="flex justify-between text-[11px] text-sky-700/80 dark:text-sky-300/80 mb-1.5 font-semibold">
                <span>완료 {formatCurrency(completedPaymentTotal)}</span>
                <span>총 {formatCurrency(monthlyTotalPayment)}</span>
              </div>
              <div className="h-1.5 w-full bg-sky-200/80 dark:bg-sky-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 dark:bg-sky-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((completedPaymentTotal / monthlyTotalPayment) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 완료 목록 */}
        {filteredCompleted.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
                완료된 항목 ({filteredCompleted.length})
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {filteredCompleted.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={setEditingTodo}
                  onDelete={setDeletingTodo}
                  onCopyAccount={handleCopyAccount}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 left-0 right-0 pointer-events-none z-30">
        <div className="max-w-lg mx-auto px-5 flex justify-end">
          <Button
            type="button"
            aria-label="할일 추가"
            onClick={() => setShowAddForm(true)}
            className="pointer-events-auto h-14 w-14 rounded-full p-0 shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="size-6 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <TodoForm
          onSubmit={(data) => handleAdd(data as { title: string })}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {editingTodo && (
        <TodoForm
          todo={editingTodo}
          onSubmit={handleEditSave}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {deletingTodo && (
        <ConfirmDialog
          message="이 할일을 삭제할까요?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTodo(null)}
        />
      )}
    </div>
  );
}

