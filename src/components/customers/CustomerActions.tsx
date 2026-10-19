"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { customerApi, type ResponseCustomers } from "@/src/services/customers";
import CreateModalForm from "./CreateModalForm";

export default function CustomerActions({ customer }: { customer: ResponseCustomers }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setError("");
    setIsDeleting(true);
    try {
      await customerApi.remove(customer.id);
      setIsDeleteOpen(false);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete customer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          aria-label={`Edit ${customer.name}`}
          title="Edit customer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => { setError(""); setIsDeleteOpen(true); }}
          aria-label={`Delete ${customer.name}`}
          title="Delete customer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {isEditOpen && (
        <CreateModalForm
          customer={customer}
          onClose={() => setIsEditOpen(false)}
          onCreated={() => router.refresh()}
        />
      )}

      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) setIsDeleteOpen(false); }}
        >
          <section role="alertdialog" aria-modal="true" aria-labelledby={`delete-customer-title-${customer.id}`} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`delete-customer-title-${customer.id}`} className="text-lg font-semibold text-slate-900">Delete customer?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">This will permanently delete <span className="font-semibold text-slate-900">{customer.name}</span>.</p>
              </div>
              <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting ? "Deleting…" : "Delete customer"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
