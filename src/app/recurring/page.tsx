"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Plus, CalendarClock, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { db, RECURRING_PAYMENTS_COLLECTION } from "@/lib/firebase";
import type { RecurringPayment } from "@/types/recurringPayment";
import { formatCurrency } from "@/utils/format";
import { createManualRecurringTodo } from "@/utils/recurringTodo";
import RecurringPaymentList from "@/components/RecurringPaymentList";
import RecurringPaymentForm, {
  RecurringPaymentInput,
} from "@/components/RecurringPaymentForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";

export default function RecurringPage() {
  const [payments, setPayments] = useState<RecurringPayment[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [deletingPayment, setDeletingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, RECURRING_PAYMENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPayments(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RecurringPayment))
      );
    });
    return unsubscribe;
  }, []);

  const activePayments = useMemo(
    () => (payments ?? []).filter((p) => p.active),
    [payments]
  );

  // 총 고정 지출액 계산
  const totalMonthlyAmount = useMemo(() => {
    return activePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [activePayments]);

  const handleAdd = async (data: RecurringPaymentInput) => {
    try {
      await addDoc(collection(db, RECURRING_PAYMENTS_COLLECTION), {
        ...data,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setShowAddForm(false);
      toast.success("정기입금 항목이 추가되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleEditSave = async (data: RecurringPaymentInput) => {
    if (!editingPayment) return;
    try {
      await updateDoc(doc(db, RECURRING_PAYMENTS_COLLECTION, editingPayment.id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      setEditingPayment(null);
      toast.success("수정되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPayment) return;
    try {
      await updateDoc(doc(db, RECURRING_PAYMENTS_COLLECTION, deletingPayment.id), {
        active: false,
        updatedAt: Timestamp.now(),
      });
      setDeletingPayment(null);
      toast.success("정기입금 항목이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("저장하지 못했습니다. 다시 시도해주세요.");
    }
  };

  // 정기입금을 사용자가 즉시 투두리스트에 올리기
  const handleAddToTodo = async (payment: RecurringPayment) => {
    try {
      await createManualRecurringTodo(payment);
      toast.success(`'${payment.recipient}' 입금이 Todo List에 등록되었습니다! 📋`);
    } catch (err) {
      console.error(err);
      toast.error("투두리스트 등록에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-1 flex-col px-4 sm:px-6">
      {/* 헤더 및 요약 카드 */}
      <header className="pt-7 pb-4">
        <h1 className="text-2xl font-bold text-foreground">
          매월 정기입금 관리
        </h1>

        {/* 요약 카드 (흑백 투톤) */}
        <div className="mt-4 rounded-3xl bg-zinc-900 p-5 text-white shadow-md border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-zinc-300" /> 월 고정 입금 합계
            </span>
            <span className="text-xs bg-zinc-800 text-zinc-200 px-2.5 py-0.5 rounded-full font-medium">
              총 {activePayments.length}건
            </span>
          </div>

          <div className="mt-2 text-3xl font-extrabold tracking-tight font-mono">
            {formatCurrency(totalMonthlyAmount)}
          </div>

          {showGuide && (
            <div
              onClick={() => setShowGuide(false)}
              className="mt-3 flex items-center justify-between rounded-xl bg-zinc-800/80 px-3 py-2 text-[11px] text-zinc-300 cursor-pointer hover:bg-zinc-800 transition-all group"
            >
              <span>💡 '투두 올리기' 버튼을 누르면 필요할 때 즉시 할일 목록에 등록됩니다.</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-white ml-2 shrink-0">✕</span>
            </div>
          )}
        </div>
      </header>

      {/* 목록 영역 */}
      <main className="flex-1 pb-6">
        {payments === null && (
          <div className="py-16 text-center">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent mb-2" />
            <p className="text-sm text-zinc-500">데이터를 불러오는 중...</p>
          </div>
        )}

        {payments !== null && activePayments.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <CalendarClock className="size-6" />
            </div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">등록된 정기입금이 없습니다</p>
            <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line">
              {"매달 직접 계좌이체해야 하는 항목을\n하단 + 버튼을 눌러 등록해 보세요."}
            </p>
          </div>
        )}

        {payments !== null && activePayments.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-zinc-500 tracking-wide uppercase">
                등록된 정기입금 목록
              </h2>
              <span className="text-xs text-zinc-500">
                입금일 빠른 순
              </span>
            </div>
            <RecurringPaymentList
              payments={activePayments}
              onSelect={setEditingPayment}
              onAddToTodo={handleAddToTodo}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 left-0 right-0 pointer-events-none z-30">
        <div className="max-w-lg mx-auto px-5 flex justify-end">
          <Button
            type="button"
            aria-label="정기입금 추가"
            onClick={() => setShowAddForm(true)}
            className="pointer-events-auto h-14 w-14 rounded-full p-0 shadow-lg shadow-zinc-900/20 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="size-6 stroke-[2.5]" />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <RecurringPaymentForm
          onSubmit={handleAdd}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {editingPayment && (
        <RecurringPaymentForm
          payment={editingPayment}
          onSubmit={handleEditSave}
          onDelete={() => {
            setDeletingPayment(editingPayment);
            setEditingPayment(null);
          }}
          onClose={() => setEditingPayment(null)}
        />
      )}

      {deletingPayment && (
        <ConfirmDialog
          message={"이 정기입금을 삭제할까요?\n이미 생성된 할일은 유지됩니다."}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingPayment(null)}
        />
      )}
    </div>
  );
}

