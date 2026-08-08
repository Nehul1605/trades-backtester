import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

export function getMediaUrl(url?: string | null): string {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
    if (
      (url.includes("localhost:") || url.includes("127.0.0.1")) &&
      !backendUrl.includes("localhost") &&
      !backendUrl.includes("127.0.0.1")
    ) {
      const uploadsIndex = url.indexOf("/uploads/");
      if (uploadsIndex !== -1) {
        const pathPart = url.substring(uploadsIndex);
        const cleanBackend = backendUrl.replace(/\/+$/, "");
        return `${cleanBackend}${pathPart}`;
      }
    }
    return url;
  }

  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555").replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${backendUrl}${cleanPath}`;
}

