import api from "./axios-client";

export type SearchEntityType =
  | "customer"
  | "user"
  | "bank"
  | "sale"
  | "payment"
  | "cheque"
  | "expense"
  | "role"
  | "navigation";

export interface SearchResult {
  id: number | null;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export interface SearchResponse {
  status: string;
  data: {
    results: SearchResult[];
  };
}

export async function globalSearch(query: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>("/search", {
    params: { q: query },
  });
  return data;
}
