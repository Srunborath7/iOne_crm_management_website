import { httpClient } from "@/src/services/http/client";
import {
  buildProductFormData,
  type ProductCreate,
  type ProductDetailResponse,
  type ProductListResponse,
  type ProductUpdate,
} from "./type";

const BASE_URL = "/products";

export interface ListProductsParams {
  offset?: number;
  limit?: number;
  search?: string;
  brand_id?: string;
  category_id?: string;
  is_active?: boolean;
}

function productPath(id: string): string {
  return `${BASE_URL}/${encodeURIComponent(id)}`;
}

function buildListQuery(params: ListProductsParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  return query.toString();
}

export const ProductsApi = {
  list(
    params: ListProductsParams = {},
    options?: RequestInit,
  ): Promise<ProductListResponse> {
    const query = buildListQuery(params);
    return httpClient.get<ProductListResponse>(
      `${BASE_URL}/${query ? `?${query}` : ""}`,
      options,
    );
  },

  getById(id: string): Promise<ProductDetailResponse> {
    return httpClient.get<ProductDetailResponse>(productPath(id));
  },

  create(data: ProductCreate, image?: File | null): Promise<ProductDetailResponse> {
    return httpClient.post<ProductDetailResponse>(
      `${BASE_URL}/`,
      buildProductFormData({ data, image }),
    );
  },

  update(
    id: string,
    data: ProductUpdate,
    image?: File | null,
  ): Promise<ProductDetailResponse> {
    return httpClient.patch<ProductDetailResponse>(
      productPath(id),
      buildProductFormData({ data, image }),
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(productPath(id));
  },
};
