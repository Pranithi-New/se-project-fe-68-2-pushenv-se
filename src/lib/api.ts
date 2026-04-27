import { clearUserInfo } from "@/lib/auth";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").endsWith("/")
  ? `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").slice(0, -1)}/api/v1`
  : `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1`;

let csrfTokenCache: string | null = null;

async function getCsrfToken() {
  if (csrfTokenCache) return csrfTokenCache;
  try {
    const res = await fetch(BASE_URL + "/csrf-token", { credentials: "include" });
    const data = await res.json();
    csrfTokenCache = data.csrfToken;
    return csrfTokenCache;
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
    return null;
  }
}

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

  if (init.method && !["GET", "HEAD", "OPTIONS"].includes(init.method.toUpperCase())) {
    const token = await getCsrfToken();
    if (token) {
      headers.set("x-csrf-token", token);
    }
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && globalThis.window !== undefined && !path.startsWith("/auth/")) {
    clearUserInfo();
    globalThis.window.location.href = "/signin";
  }

  const json = await response.json();

  if (!response.ok) {
    if (json?.error === "Invalid CSRF token" || response.status === 403) {
      csrfTokenCache = null;
    }
    throw json;
  }

  if (path.startsWith("/auth/login") || path.startsWith("/auth/logout") || path.startsWith("/auth/register")) {
    csrfTokenCache = null;
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
