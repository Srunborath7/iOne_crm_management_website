"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { customerApi } from "@/src/services/customers";
import type {
  CreateCustomers,
  Gender,
  ResponseCustomers,
} from "@/src/services/customers";
import { useToast } from "../ui/ToastProvider";

type CreateModalFormProps = {
  onClose: () => void;
  onCreated: () => void;
  customer?: ResponseCustomers;
};

export default function CreateModalForm({
  onClose,
  onCreated,
  customer,
}: CreateModalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const optional = (name: string) =>
      String(form.get(name) ?? "").trim() || null;
    const payload: CreateCustomers = {
      name: String(form.get("name") ?? "").trim(),
      age: Number(form.get("age")),
      gender: String(form.get("gender") ?? "other") as Gender,
      phone: optional("phone"),
      email: optional("email"),
      address: optional("address"),
      note: optional("note"),
      is_active: form.get("is_active") === "on",
    };

    try {
      if (customer) await customerApi.update(customer.id, payload);
      else await customerApi.create(payload);
      onCreated();
      onClose();
      toast.success(
        customer
          ? "Customer updated successfully."
          : "Customer created successfully.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Could not ${customer ? "update" : "create"} customer. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="customer-form-title"
              className="text-xl font-semibold text-slate-900"
            >
              {customer ? "Edit customer" : "New customer"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {customer
                ? "Update this customer’s details."
                : "Add a customer to your workspace."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Full name <span className="text-red-500">*</span>
              <input
                name="name"
                required
                maxLength={50}
                autoFocus
                defaultValue={customer?.name ?? ""}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Customer name"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Age <span className="text-red-500">*</span>
              <input
                name="age"
                type="number"
                required
                min={0}
                max={120}
                defaultValue={customer?.age ?? ""}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Age"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Gender
              <select
                name="gender"
                defaultValue={customer?.gender ?? "other"}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="other">Other</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                type="email"
                maxLength={50}
                defaultValue={customer?.email ?? ""}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="name@example.com"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                name="phone"
                type="tel"
                maxLength={15}
                defaultValue={customer?.phone ?? ""}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Phone number"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Address
              <input
                name="address"
                defaultValue={customer?.address ?? ""}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Street, city"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Note
              <textarea
                name="note"
                rows={3}
                defaultValue={customer?.note ?? ""}
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Additional details"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={customer?.is_active ?? true}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Active customer
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? customer
                  ? "Saving…"
                  : "Creating…"
                : customer
                  ? "Save changes"
                  : "Create customer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
