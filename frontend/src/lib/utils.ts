import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPakistaniCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return "PKR 0";
  
  if (amount >= 10000000) { // 1 Crore = 10,000,000
    const crore = amount / 10000000;
    return `PKR ${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  }
  if (amount >= 100000) { // 1 Lac = 100,000
    const lac = amount / 100000;
    return `PKR ${lac % 1 === 0 ? lac : lac.toFixed(2)} Lac`;
  }
  return `PKR ${amount.toLocaleString()}`;
}
