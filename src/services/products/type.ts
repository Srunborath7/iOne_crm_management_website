export type ProductCondition = "new" | "used" | "refurbished";

/** Pydantic serializes Decimal as a string in JSON, e.g. "1099.00". */
export type Decimal = string;

export interface ProductAuditUser {
  id: string;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  model: string | null;
  description: string | null;
  brand_id: string | null;
  category_id: string | null;
  condition: ProductCondition;
  storage: string | null;
  ram: string | null;
  color: string | null;
  operating_system: string | null;
  screen_size: string | null;
  battery_capacity: string | null;
  connectivity: string | null;
  cost_price: Decimal;
  selling_price: Decimal;
  discount_price: Decimal | null;
  stock_quantity: number;
  min_stock: number;
  warranty_months: number;
  image_url: string | null;
  barcode: string | null;
  manufacturer: string | null;
  is_active: boolean;
  created_by_id: string | null;
  updated_by_id: string | null;
  created_by: ProductAuditUser | null;
  updated_by: ProductAuditUser | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** Request body for creating a product (sent as JSON in the `data` form field). */
export interface ProductCreate {
  name: string;
  sku: string;
  model?: string | null;
  description?: string | null;
  brand_id?: string | null;
  category_id?: string | null;
  condition?: ProductCondition;
  storage?: string | null;
  ram?: string | null;
  color?: string | null;
  operating_system?: string | null;
  screen_size?: string | null;
  battery_capacity?: string | null;
  connectivity?: string | null;
  cost_price?: number | string;
  selling_price: number | string;
  discount_price?: number | string | null;
  stock_quantity?: number;
  min_stock?: number;
  warranty_months?: number;
  image_url?: string | null;
  barcode?: string | null;
  manufacturer?: string | null;
  is_active?: boolean;
}

/** Request body for updating a product. Every field is optional. */
export type ProductUpdate = Partial<ProductCreate>;

export interface ProductListResponse {
  message: string;
  data: Product[];
  total: number;
  offset: number;
  limit: number;
}

export interface ProductDetailResponse {
  message: string;
  data: Product;
}

/** Create/update payload plus an optional image file, as sent to the API. */
export interface ProductFormPayload<T = ProductCreate> {
  data: T;
  image?: File | null;
}

/** Build the multipart body the backend expects: `data` (JSON string) + `image` (file). */
export function buildProductFormData<T extends ProductCreate | ProductUpdate>(
  payload: ProductFormPayload<T>,
): FormData {
  const form = new FormData();
  form.append("data", JSON.stringify(payload.data));
  if (payload.image) {
    form.append("image", payload.image);
  }
  return form;
}