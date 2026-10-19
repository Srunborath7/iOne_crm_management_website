"use client";

import { useEffect, useState } from "react";
import { ProductsApi, type Product } from "@/src/services/products";

const PAGE_SIZE = 10;

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProducts() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await ProductsApi.list({ offset: 0, limit: PAGE_SIZE });
        if (isCurrent) setProducts(response.data);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load products. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Products</h1>

      {loading ? (
        <p role="status" className="text-sm text-slate-600">
          Loading products…
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-red-700">
          {loadError}
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-600">No products found.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-slate-900">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {product.selling_price}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
