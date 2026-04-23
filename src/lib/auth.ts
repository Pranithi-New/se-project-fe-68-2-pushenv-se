const TOKEN_KEY = "job-fair-token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; Max-Age=604800`;
  window.dispatchEvent(new Event("auth-change"));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("auth-change"));
}
