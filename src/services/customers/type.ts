export type Gender = "male" | "female" | "other";

export type CreateCustomers = {
    name: string;            // max 50 chars
    age: number;
    gender?: Gender;         // defaults to "other" on the server
    phone?: string | null;   // max 15 chars, unique
    email?: string | null;   // max 50 chars, unique
    address?: string | null;
    is_active?: boolean;     // defaults to true on the server
    note?: string | null;
};

export type UpdateCustomers = Partial<CreateCustomers>;

export type ResponseCustomers = {
    id: string;              // UUID
    name: string;
    age: number;
    gender: Gender;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    note: string | null;
    created_at: string;      // ISO 8601 datetime
    updated_at: string;      // ISO 8601 datetime
};

// Matches your CustomerListResponse from the backend
export type ListCustomersResponse = {
    message: string;
    data: ResponseCustomers[];
    total: number;
    offset: number;
    limit: number;
};
export type CustomerResponseWrapper = {
    message: string;
    data: ResponseCustomers;
};