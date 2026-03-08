import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function formatWithDots(val: string | number): string {
  if (val === null || val === undefined || val === "") return "";

  if (typeof val === "number") {
    val = Math.round(val);
  }

  const digits = val.toString().replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
