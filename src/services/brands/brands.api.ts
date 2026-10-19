// brands.api.ts
import { httpClient } from "@/src/services/http/client";
import type {
  BrandDetailResponse,
  BrandImageListResponse,
  BrandListParams,
  BrandListResponse,
  CreateBrand,
  UpdateBrand,
} from "./type";

const BASE_URL = "/brands";

export type ListBrandsParams = BrandListParams;

function brandPath(id: string): string {
  return `${BASE_URL}/${encodeURIComponent(id)}`;
}

function toBrandFormData(payload: CreateBrand | UpdateBrand): FormData {
  const formData = new FormData();

  if (payload.name !== undefined && payload.name !== null) {
    formData.append("name", payload.name);
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description ?? "");
  }
  if (payload.image) {
    formData.append("image", payload.image);
  }

  return formData;
}

function buildListQuery(params: ListBrandsParams): string {
  return new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 100),
  }).toString();
}

export const brandApi = {
  list(
    params: ListBrandsParams = {},
    options?: RequestInit,
  ): Promise<BrandListResponse> {
    return httpClient.get<BrandListResponse>(
      `${BASE_URL}/?${buildListQuery(params)}`,
      options,
    );
  },

  list_all(params: ListBrandsParams = {},
    options?: RequestInit,
  ): Promise<BrandImageListResponse> {
    return httpClient.get<BrandImageListResponse>(
      `${BASE_URL}/image?${buildListQuery(params)}`,
      options,
    );
  },
  

  getById(id: string): Promise<BrandDetailResponse> {
    return httpClient.get<BrandDetailResponse>(brandPath(id));
  },

  create(payload: CreateBrand): Promise<BrandDetailResponse> {
    return httpClient.post<BrandDetailResponse>(
      `${BASE_URL}/`,
      toBrandFormData(payload),
    );
  },

  update(id: string, payload: UpdateBrand): Promise<BrandDetailResponse> {
    return httpClient.patch<BrandDetailResponse>(
      brandPath(id),
      toBrandFormData(payload),
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(brandPath(id));
  },
};
