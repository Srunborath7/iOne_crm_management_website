import { httpClient } from "@/src/services/http/client";
import type {
  CreateCustomers,
  CustomerResponseWrapper,
  ListCustomersResponse,
  UpdateCustomers,
} from "./type";

const BASE_URL = "/customers";

export type ListCustomersParams = {
  offset?: number;
  limit?: number;
};

function customerPath(id: string): string {
  return `${BASE_URL}/${encodeURIComponent(id)}`;
}

export const customerApi = {
  list(
    params: ListCustomersParams = {},
    options?: RequestInit,
  ): Promise<ListCustomersResponse> {
    const query = new URLSearchParams({
      offset: String(params.offset ?? 0),
      limit: String(params.limit ?? 100),
    });
    return httpClient.get<ListCustomersResponse>(`${BASE_URL}/?${query.toString()}`, options);
  },

  getById(id: string): Promise<CustomerResponseWrapper> {
    return httpClient.get<CustomerResponseWrapper>(customerPath(id));
  },

  create(payload: CreateCustomers): Promise<CustomerResponseWrapper> {
    return httpClient.post<CustomerResponseWrapper>(`${BASE_URL}/`, payload);
  },

  update(id: string, payload: UpdateCustomers): Promise<CustomerResponseWrapper> {
    return httpClient.patch<CustomerResponseWrapper>(customerPath(id), payload);
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(customerPath(id));
  },
};
