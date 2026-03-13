import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!source || typeof source !== "object") return target;

  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceVal = (source as Record<string, unknown>)[key];
    const targetVal = (result as Record<string, unknown>)[key];

    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetVal,
        sourceVal,
      );
    } else if (sourceVal !== undefined) {
      (result as Record<string, unknown>)[key] = sourceVal;
    }
  });

  return result;
}

export const formatWithCommas = (value: number | string): string => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "";
  return numericValue?.toLocaleString("ko-KR") ?? "0";
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
