import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sanitizeForLog(text: string): string {
  // Hide API keys and sensitive data in logs
  return text
    .replace(/sk-[a-zA-Z0-9]{20,}/g, 'sk-***REDACTED***')
    .replace(/Bearer\s+[a-zA-Z0-9\-._~+\/]+=*/g, 'Bearer ***REDACTED***')
    .replace(/password['":\s]+['"]?[^'",\s]+['"]?/gi, 'password: ***REDACTED***');
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
