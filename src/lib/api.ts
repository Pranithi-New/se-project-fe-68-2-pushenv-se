import { clearUserInfo } from "@/lib/auth";

const BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")}/api/v1`;

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && typeof window !== "undefined") {
    clearUserInfo();
    window.location.href = "/signin";
  }

  const json = await response.json();

  if (!response.ok) {
    throw json;
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) => apiFetch<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: <T>(path: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: <T>(path: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...options }),
};
