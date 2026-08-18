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
} from "firebase/firestore";
import { db, TODOS_COLLECTION } from "@/lib/firebase";
import type { Todo } from "@/types/todo";
import { generateDueRecurringTodos } from "@/utils/recurringTodo";
import { formatCurrency } from "@/utils/format";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

export default function Home() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    generateDueRecurringTodos().catch((err) => {
      console.error("정기입금 자동생성 실패", err);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, TODOS_COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Todo))
      );
    });
    return unsubscribe;
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const incompleteTodos = useMemo(
    () => (todos ?? []).filter((t) => !t.completed),
    [todos]
  );
  const completedTodos = useMemo(
    () => (todos ?? []).filter((t) => t.completed),
    [todos]
  );

  const remainingPaymentTotal = useMemo(() => {
    return (todos ?? [])
      .filter(
        (t) =>
          t.type === "payment" &&
          !t.completed &&
          t.year === currentYear &&
          t.month === currentMonth
      )
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }, [todos, currentYear, currentMonth]);

  const handleToggle = async (todo: Todo) => {
    try {
      await updateDoc(doc(db, TODOS_COLLECTION, todo.id), {
        completed: !todo.completed,
        completedAt: !todo.completed ? Timestamp.now() : deleteField(),
      });
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
    }
  };

  const handleAdd = async (data: { title: string }) => {
    try {
      await addDoc(collection(db, TODOS_COLLECTION), {
        title: data.title,
        completed: false,
        type: "normal",
        createdAt: Timestamp.now(),
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
    }
  };

  const handleEditSave = async (data: {
    title: string;
    recipient?: string;
    amount?: number;
    bank?: string;
    accountNumber?: string;
  }) => {
    if (!editingTodo) return;
    try {
      await updateDoc(doc(db, TODOS_COLLECTION, editingTodo.id), { ...data });
      setEditingTodo(null);
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    try {
      await deleteDoc(doc(db, TODOS_COLLECTION, deletingTodo.id));
      setDeletingTodo(null);
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
    }
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      showToast("계좌번호를 복사했습니다.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5">
      <header className="pt-8 pb-4">
        <h1 className="text-2xl font-semibold text-foreground">
          {currentMonth}월 할일
        </h1>
        <div className="mt-2 flex flex-col gap-1 text-sm text-muted">
          <span>미완료 {incompleteTodos.length}개</span>
          <span>
            이번 달 남은 입금{" "}
            <span className="font-medium text-accent">
              {formatCurrency(remainingPaymentTotal)}
            </span>
          </span>
        </div>
      </header>

      <main className="flex-1">
        {todos === null && (
          <p className="py-10 text-center text-sm text-muted">불러오는 중...</p>
        )}

        {todos !== null && todos.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">할일이 없습니다.</p>
        )}

        {todos !== null && todos.length > 0 && (
          <div className="divide-y divide-border">
            {incompleteTodos.map((todo) => (
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
        )}

        {completedTodos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-medium text-muted">완료</h2>
            <div className="divide-y divide-border opacity-60">
              {completedTodos.map((todo) => (
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

      <button
        type="button"
        aria-label="할일 추가"
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-sm"
      >
        +
      </button>

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

      <Toast message={toast} />
    </div>
  );
}
