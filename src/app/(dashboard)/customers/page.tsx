import { cookies } from "next/headers";
import { Suspense } from "react";
import { customerApi } from "@/src/services/customers";
import type { ResponseCustomers } from "@/src/services/customers";
import Loading from "@/src/components/loading";
import RefreshButton from "@/src/components/RefreshButton";
import CustomerActions from "@/src/components/customers/CustomerActions";
const ACCESS_TOKEN_COOKIE = "inventory_access_token";

// This page waits for the dashboard session and customer data.
export const instant = false;
export default function CustomerPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CustomerContent />
    </Suspense>
  );
}

async function CustomerContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let customers: ResponseCustomers[] = [];
  let total = 0;
  let error = "";

  if (!token) {
    error = "Your session is missing. Sign in again to view customers.";
  } else {
    try {
      const response = await customerApi.list(
        { offset: 0, limit: 10 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      customers = response.data;
      total = response.total;
    } catch (requestError) {
      error =
        requestError instanceof Error
          ? requestError.message
          : "Could not load customers. Please try again.";
    }
  }
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Customers
          </h1>
          {!error && (
            <p className="mt-2 text-sm text-slate-600">
              {total} customer{total === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <div>
          <RefreshButton />
        </div>
      </div>
      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-5"
          role="alert"
        >
          <h2 className="font-semibold text-red-900">
            Couldn’t load customers
          </h2>
          <p className="mt-1 text-sm text-red-800">{error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No customers yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer records will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Age
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {customer.name}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-slate-500">
                        {customer.gender}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {customer.email || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {customer.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {customer.age}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${customer.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {customer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <CustomerActions customerName={customer.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > customers.length && (
            <p className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
              Showing {customers.length} of {total} customers.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
