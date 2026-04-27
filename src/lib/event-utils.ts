const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  while (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

const BASE_URL = getBaseUrl();

export function resolveAssetUrl(value?: string | null): string | null {
  if (!value) return null;
  return value.startsWith("http") ? value : `${BASE_URL}${value}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(startValue: string, endValue: string): string {
  const start = formatDate(startValue);
  const end = formatDate(endValue);
  return start === end ? start : `${start} - ${end}`;
}

export function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
