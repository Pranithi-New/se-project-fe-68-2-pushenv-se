import { clearUserInfo } from "@/lib/auth";

const getBaseUrl = () => {
  // 1. If we're in the browser, always use the relative Next.js proxy path
  if (typeof window !== "undefined") {
    return "/api/backend/api/v1";
  }
  
  // 2. If we're on the server, use the BACKEND_URL env
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.endsWith("/") 
      ? `${process.env.BACKEND_URL.slice(0, -1)}/api/v1`
      : `${process.env.BACKEND_URL}/api/v1`;
  }
  
  // 3. Fallback for local development
  const isDocker = process.env.IS_DOCKER === "true";
  return isDocker ? "http://backend:4000/api/v1" : "http://localhost:4000/api/v1";
};

const BASE_URL = getBaseUrl();

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

  // Use window.location.origin as base for relative URLs in the browser.
  // On the server, BASE_URL is absolute, so the dummy base is ignored by how new URL work.
  const dummyBase = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(BASE_URL + path, dummyBase);
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
