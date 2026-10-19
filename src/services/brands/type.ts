// types/brand.ts

/** Matches BrandResponse */
export interface Brand {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** Matches BrandListItem */
export interface BrandListItem {
  id: string;
  name: string;
  description: string | null;
}

/** Brand list item returned by the image-list endpoint. */
export interface BrandWithImageItem extends BrandListItem {
  image_url: string | null;
}

/** Create: sent as multipart/form-data alongside the image */
export interface CreateBrand {
  name: string; // 1-50 chars
  description?: string | null;
  image?: File | null;
}

/** Update: all fields optional */
export interface UpdateBrand {
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

/** Matches BrandListResponse */
export type BrandListResponse = PaginatedResponse<BrandListItem>;

/** Matches the brands/image response. */
export type BrandImageListResponse = PaginatedResponse<BrandWithImageItem>;

/** Matches BrandDetailResponse */
export interface BrandDetailResponse {
  message: string;
  data: Brand;
}

/** Query params for list endpoints */
export interface BrandListParams {
  offset?: number;
  limit?: number;
}
