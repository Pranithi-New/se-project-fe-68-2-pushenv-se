const USER_KEY = "job-fair-user";

type UserInfo = {
  id: string;
  role: string;
};

export function getUserInfo(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setUserInfo(user: UserInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function clearUserInfo() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-change"));
}
