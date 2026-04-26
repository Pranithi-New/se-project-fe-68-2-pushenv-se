import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  const trimmedUrl = url.trim();
  
  try {
    if (trimmedUrl.startsWith("/") || trimmedUrl.startsWith("#") || trimmedUrl.startsWith("?")) {
      return trimmedUrl;
    }
    if (trimmedUrl.startsWith("data:image/")) {
      return trimmedUrl;
    }
    
    const parsed = new URL(trimmedUrl);
    const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
    
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.toString();
    }
  } catch (e) {
    return "about:blank";
  }
  
  return "about:blank";
}
