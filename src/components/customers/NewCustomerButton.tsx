"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateModalForm from "./CreateModalForm";

export default function NewCustomerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        New Customer
      </button>
      {isOpen && (
        <CreateModalForm
          onClose={() => setIsOpen(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}
