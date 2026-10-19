// types/Category.ts

/** Matches CategoryResponse */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** Matches CategoryListItem */
export interface CategoryListItem {
  id: string;
  name: string;
  description: string | null;
}

/** Category list item returned by the image-list endpoint. */
export interface CategoryWithImageItem extends CategoryListItem {
  image_url: string | null;
}

/** Create: sent as multipart/form-data alongside the image */
export interface CreateCategory {
  name: string; // 1-50 chars
  description?: string | null;
  image?: File | null;
}

/** Update: all fields optional */
export interface UpdateCategory {
  name?: string | null; // 1-50 chars
  description?: string | null;
  image?: File | null;
}

/** Shared pagination envelope */
export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

/** Matches CategoryListResponse */
export type CategoryListResponse = PaginatedResponse<CategoryListItem>;

/** Matches the Categorys/image response. */
export type CategoryImageListResponse = PaginatedResponse<CategoryWithImageItem>;

/** Matches CategoryDetailResponse */
export interface CategoryDetailResponse {
  message: string;
  data: Category;
}

/** Query params for list endpoints */
export interface CategoryListParams {
  offset?: number;
  limit?: number;
}
