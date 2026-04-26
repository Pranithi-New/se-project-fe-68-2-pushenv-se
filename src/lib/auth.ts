const USER_KEY = "job-fair-user";

type UserInfo = {
  id: string;
  role: string;
};

export function getUserInfo(): UserInfo | null {
  if (globalThis.window === undefined) return null;
  const raw = globalThis.window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setUserInfo(user: UserInfo) {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  globalThis.window.dispatchEvent(new Event("auth-change"));
}

export function clearUserInfo() {
  if (globalThis.window === undefined) return;
  globalThis.window.localStorage.removeItem(USER_KEY);
  globalThis.window.dispatchEvent(new Event("auth-change"));
}
