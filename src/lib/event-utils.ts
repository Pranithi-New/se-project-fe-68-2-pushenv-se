export function resolveAssetUrl(value?: string | null): string | null {
  if (!value) return null;
  // return if it's already absolute URL
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // clean up leading slashes to ensure it starts with exactly one slash
  let cleanPath = value;
  while (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.slice(1);
  }

  // proxy /uploads/... to backend server dynamically
  return `/${cleanPath}`;
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
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
