// Categorys.api.ts
import { httpClient } from "@/src/services/http/client";
import type {
  CategoryDetailResponse,
  CategoryImageListResponse,
  CategoryListParams,
  CategoryListResponse,
  CreateCategory,
  UpdateCategory,
} from "./type";

const BASE_URL = "/categories";

export type ListCategorysParams = CategoryListParams;

function CategoryPath(id: string): string {
  return `${BASE_URL}/${encodeURIComponent(id)}`;
}

function toCategoryFormData(
  payload: CreateCategory | UpdateCategory,
): FormData {
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

function buildListQuery(params: ListCategorysParams): string {
  return new URLSearchParams({
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 100),
  }).toString();
}

export const CategoryApi = {
  list(
    params: ListCategorysParams = {},
    options?: RequestInit,
  ): Promise<CategoryListResponse> {
    return httpClient.get<CategoryListResponse>(
      `${BASE_URL}/?${buildListQuery(params)}`,
      options,
    );
  },

  list_all(
    params: ListCategorysParams = {},
    options?: RequestInit,
  ): Promise<CategoryImageListResponse> {
    return httpClient.get<CategoryImageListResponse>(
      `${BASE_URL}/image?${buildListQuery(params)}`,
      options,
    );
  },

  getById(id: string): Promise<CategoryDetailResponse> {
    return httpClient.get<CategoryDetailResponse>(CategoryPath(id));
  },

  create(payload: CreateCategory): Promise<CategoryDetailResponse> {
    return httpClient.post<CategoryDetailResponse>(
      `${BASE_URL}/`,
      toCategoryFormData(payload),
    );
  },

  update(id: string, payload: UpdateCategory): Promise<CategoryDetailResponse> {
    return httpClient.patch<CategoryDetailResponse>(
      CategoryPath(id),
      toCategoryFormData(payload),
    );
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(CategoryPath(id));
  },
};
