// utils/cookies.ts
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // SSR guard
  const target = name + "=";
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(target)) {
      // supports values with '=' inside (split once, then join)
      return decodeURIComponent(part.split("=").slice(1).join("="));
    }
  }
  return null;
}
