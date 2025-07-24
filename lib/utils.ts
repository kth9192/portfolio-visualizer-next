import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// 옵션 깊은 병합 함수
export function deepMerge(target: any, source: any) {
    if (!source) return target;
    const output = { ...target };
  
    Object.keys(source).forEach((key) => {
      if (
        source[key] instanceof Object &&
        key in target &&
        target[key] instanceof Object &&
        !(source[key] instanceof Date)
      ) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  
    return output;
  }
  
  export const formatWithCommas = (value: number | string): string => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numericValue)) return "";
    return numericValue?.toLocaleString("ko-KR") ?? 0;
  };



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
