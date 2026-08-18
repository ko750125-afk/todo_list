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
import { db, RECURRING_PAYMENTS_COLLECTION } from "@/lib/firebase";
import type { RecurringPayment } from "@/types/recurringPayment";
import RecurringPaymentList from "@/components/RecurringPaymentList";
import RecurringPaymentForm, {
  RecurringPaymentInput,
} from "@/components/RecurringPaymentForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

export default function RecurringPage() {
  const [payments, setPayments] = useState<RecurringPayment[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [deletingPayment, setDeletingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

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

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAdd = async (data: RecurringPaymentInput) => {
    try {
      await addDoc(collection(db, RECURRING_PAYMENTS_COLLECTION), {
        ...data,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
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
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
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
    } catch (err) {
      console.error(err);
      showToast("저장하지 못했습니다.\n다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5">
      <header className="pt-8 pb-4">
        <h1 className="text-2xl font-semibold text-foreground">정기입금</h1>
      </header>

      <main className="flex-1">
        {payments === null && (
          <p className="py-10 text-center text-sm text-muted">불러오는 중...</p>
        )}

        {payments !== null && activePayments.length === 0 && (
          <p className="whitespace-pre-line py-10 text-center text-sm text-muted">
            {"등록된 정기입금이 없습니다.\n매달 직접 입금해야 하는 항목을\n등록해 보세요."}
          </p>
        )}

        {payments !== null && activePayments.length > 0 && (
          <RecurringPaymentList
            payments={activePayments}
            onSelect={setEditingPayment}
          />
        )}
      </main>

      <button
        type="button"
        onClick={() => setShowAddForm(true)}
        className="mb-8 w-full rounded-xl bg-accent py-4 text-base font-medium text-white"
      >
        + 정기입금 추가
      </button>

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

      <Toast message={toast} />
    </div>
  );
}
