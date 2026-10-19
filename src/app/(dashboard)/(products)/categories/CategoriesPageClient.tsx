"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import {
  CategoryApi,
  type CategoryWithImageItem,
  type CreateCategory,
} from "@/src/services/categories";

const PAGE_SIZE = 10;
const API_ORIGIN = new URL(
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1")
    .replace(/^['"]|['"]$/g, "")
    .trim(),
).origin;

function CategoryImage({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  let imageSrc = src;
  try {
    imageSrc = new URL(src, `${API_ORIGIN}/`).toString();
  } catch {
    // Keep the original URL so the image error fallback can handle it.
  }

  if (failed) {
    return (
      <span
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
        role="img"
        aria-label={`${name} image unavailable`}
      >
        <Tag size={19} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={`${name} logo`}
      onError={() => setFailed(true)}
      className="h-11 w-11 rounded-lg border border-slate-200 bg-white object-contain p-1"
    />
  );
}

export default function CategoryPage() {
  const [Categorys, setCategorys] = useState<CategoryWithImageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formCategory, setFormCategory] = useState<CategoryWithImageItem | null | undefined>(
    undefined,
  );
  const [CategoryToDelete, setCategoryToDelete] = useState<CategoryWithImageItem | null>(
    null,
  );
  const [mutationError, setMutationError] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const loadCategorys = useCallback(async (nextOffset: number) => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await CategoryApi.list_all({
        offset: nextOffset,
        limit: PAGE_SIZE,
      });
      setCategorys(response.data);
      setTotal(response.total);
      setOffset(nextOffset);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Could not load Categorys. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategorys(0);
  }, [loadCategorys]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formCategory === undefined) return;
    setMutationError("");
    setIsMutating(true);
    const values = new FormData(event.currentTarget);
    const file = values.get("image");
    const payload: CreateCategory = {
      name: String(values.get("name") ?? "").trim(),
      description: String(values.get("description") ?? "").trim() || null,
      image: file instanceof File && file.size > 0 ? file : null,
    };

    try {
      if (formCategory) await CategoryApi.update(formCategory.id, payload);
      else await CategoryApi.create(payload);
      setFormCategory(undefined);
      await loadCategorys(offset);
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : "Could not save Category. Please try again.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDelete() {
    if (!CategoryToDelete) return;
    setMutationError("");
    setIsMutating(true);
    try {
      await CategoryApi.remove(CategoryToDelete.id);
      setCategoryToDelete(null);
      await loadCategorys(
        Categorys.length === 1 && offset > 0
          ? Math.max(0, offset - PAGE_SIZE)
          : offset,
      );
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : "Could not delete Category. Please try again.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Product catalog
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Categorys
          </h1>
          {!loadError && (
            <p className="mt-2 text-sm text-slate-600">
              {total} Category{total === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setMutationError("");
            setFormCategory(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus size={17} /> Add Category
        </button>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <h2 className="font-semibold text-red-900">Couldn't load Categorys</h2>
          <p className="mt-1 text-sm text-red-800">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadCategorys(offset)}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div
          className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
          role="status"
        >
          Loading Categorys…
        </div>
      ) : Categorys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Tag size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No Categorys yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a Category to organize your product catalog.
          </p>
          <button
            type="button"
            onClick={() => setFormCategory(null)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Add first Category
          </button>
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
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Categorys.map((Category) => (
                  <tr key={Category.id} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {Category.image_url ? (
                          <CategoryImage src={Category.image_url} name={Category.name} />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <Tag size={19} />
                          </span>
                        )}
                        <span className="font-medium text-slate-900">
                          {Category.name}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xl px-5 py-3.5 text-sm text-slate-600">
                      {Category.description || (
                        <span className="text-slate-400">No description</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMutationError("");
                            setFormCategory(Category);
                          }}
                          aria-label={`Edit ${Category.name}`}
                          title="Edit Category"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMutationError("");
                            setCategoryToDelete(Category);
                          }}
                          aria-label={`Delete ${Category.name}`}
                          title="Delete Category"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <p className="text-sm text-slate-500">
                Showing {offset + 1}–{Math.min(offset + Categorys.length, total)}{" "}
                of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={offset === 0 || loading}
                  onClick={() =>
                    void loadCategorys(Math.max(0, offset - PAGE_SIZE))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total || loading}
                  onClick={() => void loadCategorys(offset + PAGE_SIZE)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {formCategory !== undefined && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isMutating)
              setFormCategory(undefined);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="Category-form-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="Category-form-title"
                  className="text-xl font-semibold text-slate-900"
                >
                  {formCategory ? "Edit Category" : "Add Category"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a name, description, and optional image.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormCategory(undefined)}
                disabled={isMutating}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
              <label className="block text-sm font-medium text-slate-700">
                Category name <span className="text-red-500">*</span>
                <input
                  name="name"
                  required
                  maxLength={50}
                  defaultValue={formCategory?.name ?? ""}
                  autoFocus
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Acme"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={formCategory?.description ?? ""}
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="A short description"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Category image
                <span className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-normal text-slate-600 hover:border-blue-400 hover:bg-blue-50/50">
                  <ImagePlus size={18} className="text-blue-600" />
                  Choose an image
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </span>
                {formCategory?.image_url && (
                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    Current image will remain unless you choose a replacement.
                  </span>
                )}
              </label>
              {mutationError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {mutationError}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setFormCategory(undefined)}
                  disabled={isMutating}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMutating
                    ? "Saving…"
                    : formCategory
                      ? "Save changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {CategoryToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isMutating)
              setCategoryToDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-Category-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-Category-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Delete Category?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-900">
                    {CategoryToDelete.name}
                  </span>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isMutating}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            {mutationError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {mutationError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isMutating}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isMutating}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMutating ? "Deleting…" : "Delete Category"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
