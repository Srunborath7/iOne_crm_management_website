"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import {
  ProductsApi,
  type Product,
  type ProductCondition,
  type ProductCreate,
} from "@/src/services/products";
import { CategoryApi } from "@/src/services/categories";
import type { CategoryListItem } from "@/src/services/categories/type";
import { brandApi } from "@/src/services/brands";
import type { BrandListItem } from "@/src/services/brands/type";

const PAGE_SIZE = 10;
const emptyMessage = "No products match your filters.";
const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";
const money = (amount: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(amount) || 0,
  );
const API_ORIGIN = new URL(
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1")
    .replace(/^['"]|['"]$/g, "")
    .trim(),
).origin;

function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  let imageSrc = product.image_url || "";
  try {
    imageSrc = new URL(imageSrc, `${API_ORIGIN}/`).toString();
  } catch {
    // The fallback below handles invalid image URLs.
  }
  if (!product.image_url || failed)
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <ShoppingBag size={20} />
      </span>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt=""
      onError={() => setFailed(true)}
      className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
    />
  );
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editor, setEditor] = useState<Product | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [brands, setBrands] = useState<BrandListItem[]>([]);

  const loadProducts = useCallback(
    async (nextOffset: number, query = search, nextStatus = status) => {
      setLoading(true);
      setLoadError("");
      try {
        const response = await ProductsApi.list({
          offset: nextOffset,
          limit: PAGE_SIZE,
          search: query || undefined,
          is_active: nextStatus === "all" ? undefined : nextStatus === "active",
        });
        setProducts(response.data);
        setTotal(response.total);
        setOffset(nextOffset);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status],
  );

  useEffect(() => {
    async function initializeProducts() {
      await loadProducts(0);
    }
    void initializeProducts();
  }, [loadProducts]);
  useEffect(() => {
    void Promise.all([
      CategoryApi.list({ limit: 100 }),
      brandApi.list({ limit: 100 }),
    ])
      .then(([categoryResponse, brandResponse]) => {
        setCategories(categoryResponse.data);
        setBrands(brandResponse.data);
      })
      .catch(() => {
        /* Product editing remains available if lookup lists are unavailable. */
      });
  }, []);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const activeCount = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products],
  );

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchInput.trim();
    setSearch(query);
    void loadProducts(0, query, status);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editor === undefined) return;
    setMutationError("");
    setMutating(true);
    const values = new FormData(event.currentTarget);
    const value = (key: string) => String(values.get(key) ?? "").trim();
    const file = values.get("image");
    const payload: ProductCreate = {
      name: value("name"),
      sku: value("sku"),
      model: value("model") || null,
      description: value("description") || null,
      brand_id: value("brand_id") || null,
      category_id: value("category_id") || null,
      condition: value("condition") as ProductCondition,
      storage: value("storage") || null,
      ram: value("ram") || null,
      color: value("color") || null,
      cost_price: value("cost_price") || "0",
      selling_price: value("selling_price"),
      discount_price: value("discount_price") || null,
      stock_quantity: Number(value("stock_quantity") || 0),
      min_stock: Number(value("min_stock") || 0),
      warranty_months: Number(value("warranty_months") || 0),
      is_active: value("is_active") === "true",
    };
    try {
      if (editor)
        await ProductsApi.update(
          editor.id,
          payload,
          file instanceof File && file.size ? file : null,
        );
      else
        await ProductsApi.create(
          payload,
          file instanceof File && file.size ? file : null,
        );
      setEditor(undefined);
      await loadProducts(offset);
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : "Could not save product. Please try again.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function removeProduct() {
    if (!deleteTarget) return;
    setMutationError("");
    setMutating(true);
    try {
      await ProductsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadProducts(
        products.length === 1 && offset > 0
          ? Math.max(0, offset - PAGE_SIZE)
          : offset,
      );
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : "Could not delete product. Please try again.",
      );
    } finally {
      setMutating(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            Product catalog
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Products
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your inventory, pricing, and product details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMutationError("");
            setEditor(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus size={17} /> Add product
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Products in catalog"
          value={total.toLocaleString()}
          icon={<ShoppingBag size={19} />}
        />
        <SummaryCard
          label="On this page"
          value={products.length.toString()}
          icon={<Archive size={19} />}
        />
        <SummaryCard
          label="Active on this page"
          value={activeCount.toString()}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <form onSubmit={applySearch} className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, SKU, or model"
              aria-label="Search products"
              className={`${inputClass} pl-9 pr-20`}
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
              Search
            </button>
          </form>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">Status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                void loadProducts(0, search, event.target.value);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {loadError ? (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <h2 className="font-semibold text-red-900">
              Couldn’t load products
            </h2>
            <p className="mt-1 text-sm text-red-800">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProducts(offset)}
              className="mt-3 text-sm font-semibold text-red-800 underline"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div
            role="status"
            className="p-14 text-center text-sm text-slate-500"
          >
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShoppingBag size={22} />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900">
              {emptyMessage}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or add a product to your catalog.
            </p>
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Add product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Product",
                      "SKU / Model",
                      "Category",
                      "Price",
                      "Stock",
                      "Status",
                      "",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductImage product={product} />
                          <div className="min-w-0">
                            <p className="max-w-64 truncate text-sm font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs capitalize text-slate-500">
                              {product.condition}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {product.sku}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.model || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {categories.find(
                          (item) => item.id === product.category_id,
                        )?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {money(
                            product.discount_price || product.selling_price,
                          )}
                        </p>
                        {product.discount_price && (
                          <p className="text-xs text-slate-400 line-through">
                            {money(product.selling_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${product.stock_quantity <= product.min_stock ? "text-amber-700" : "text-slate-700"}`}
                        >
                          {product.stock_quantity}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                          units
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => {
                              setMutationError("");
                              setEditor(product);
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => {
                              setMutationError("");
                              setDeleteTarget(product);
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
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
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {offset + 1}–{Math.min(offset + products.length, total)}
                </span>{" "}
                of <span className="font-medium text-slate-700">{total}</span>{" "}
                products
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    void loadProducts(Math.max(0, offset - PAGE_SIZE))
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="px-1 text-sm text-slate-600">
                  Page {currentPage} of {pages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= pages}
                  onClick={() => void loadProducts(offset + PAGE_SIZE)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {editor !== undefined && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !mutating)
              setEditor(undefined);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                  Product catalog
                </p>
                <h2
                  id="product-dialog-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {editor ? "Edit product" : "Add product"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the product details and inventory information.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={mutating}
                onClick={() => setEditor(undefined)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={saveProduct} className="space-y-6 p-5 sm:p-7">
              {mutationError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                >
                  {mutationError}
                </p>
              )}
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-3 text-sm font-semibold text-slate-900">
                  Basic information
                </legend>
                <Field label="Product name *">
                  <input
                    name="name"
                    required
                    defaultValue={editor?.name || ""}
                    className={inputClass}
                    placeholder="e.g. Wireless headphones"
                  />
                </Field>
                <Field label="SKU *">
                  <input
                    name="sku"
                    required
                    defaultValue={editor?.sku || ""}
                    className={inputClass}
                    placeholder="e.g. WH-1000"
                  />
                </Field>
                <Field label="Model">
                  <input
                    name="model"
                    defaultValue={editor?.model || ""}
                    className={inputClass}
                  />
                </Field>
                <Field label="Condition">
                  <select
                    name="condition"
                    defaultValue={editor?.condition || "new"}
                    className={inputClass}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </Field>
                <Field label="Brand">
                  <select
                    name="brand_id"
                    defaultValue={editor?.brand_id || ""}
                    className={inputClass}
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category">
                  <select
                    name="category_id"
                    defaultValue={editor?.category_id || ""}
                    className={inputClass}
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editor?.description || ""}
                      className={inputClass}
                      placeholder="Add product details…"
                    />
                  </Field>
                </div>
              </fieldset>
              <fieldset className="grid gap-4 sm:grid-cols-3">
                <legend className="mb-3 text-sm font-semibold text-slate-900">
                  Pricing & inventory
                </legend>
                <Field label="Cost price">
                  <input
                    name="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editor?.cost_price || "0"}
                    className={inputClass}
                  />
                </Field>
                <Field label="Selling price *">
                  <input
                    name="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={editor?.selling_price || ""}
                    className={inputClass}
                  />
                </Field>
                <Field label="Discount price">
                  <input
                    name="discount_price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editor?.discount_price || ""}
                    className={inputClass}
                  />
                </Field>
                <Field label="Stock quantity">
                  <input
                    name="stock_quantity"
                    type="number"
                    min="0"
                    defaultValue={editor?.stock_quantity ?? 0}
                    className={inputClass}
                  />
                </Field>
                <Field label="Low stock alert">
                  <input
                    name="min_stock"
                    type="number"
                    min="0"
                    defaultValue={editor?.min_stock ?? 0}
                    className={inputClass}
                  />
                </Field>
                <Field label="Warranty (months)">
                  <input
                    name="warranty_months"
                    type="number"
                    min="0"
                    defaultValue={editor?.warranty_months ?? 0}
                    className={inputClass}
                  />
                </Field>
              </fieldset>
              <fieldset className="grid gap-4 sm:grid-cols-3">
                <legend className="mb-3 text-sm font-semibold text-slate-900">
                  Specifications
                </legend>
                <Field label="Storage">
                  <input
                    name="storage"
                    defaultValue={editor?.storage || ""}
                    className={inputClass}
                    placeholder="128 GB"
                  />
                </Field>
                <Field label="RAM">
                  <input
                    name="ram"
                    defaultValue={editor?.ram || ""}
                    className={inputClass}
                    placeholder="8 GB"
                  />
                </Field>
                <Field label="Color">
                  <input
                    name="color"
                    defaultValue={editor?.color || ""}
                    className={inputClass}
                  />
                </Field>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product image">
                  <span className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:border-blue-400">
                    <ImagePlus size={17} className="text-slate-400" />
                    <span className="flex-1">Choose an image</span>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="max-w-36 text-xs"
                    />
                  </span>
                </Field>
                <Field label="Visibility">
                  <select
                    name="is_active"
                    defaultValue={
                      editor?.is_active === false ? "false" : "true"
                    }
                    className={inputClass}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </Field>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={mutating}
                  onClick={() => setEditor(undefined)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutating}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {mutating
                    ? "Saving…"
                    : editor
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>
            <h2
              id="delete-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Delete product?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              “{deleteTarget.name}” will be permanently removed from your
              catalog.
            </p>
            {mutationError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {mutationError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={() => void removeProduct()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {mutating ? "Deleting…" : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
