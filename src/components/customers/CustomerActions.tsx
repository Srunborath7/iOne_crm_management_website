"use client";

import { Pencil, Trash2 } from "lucide-react";

export default function CustomerActions({ customerName }: { customerName: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => window.alert(`Edit ${customerName}`)}
        aria-label={`Edit ${customerName}`}
        title="Edit customer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => window.alert(`Delete ${customerName}`)}
        aria-label={`Delete ${customerName}`}
        title="Delete customer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
