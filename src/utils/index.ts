import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Utility to conditionally join class names and merge Tailwind conflicts.
 * Example:
 *   cn("p-2", isActive && "bg-blue-500", "p-4") => "bg-blue-500 p-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
 