import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a wei value to a human-readable token amount.
 * @param wei  bigint value in wei (18 decimals)
 * @param decimals  number of decimal places to show
 */
export function formatToken(wei: bigint | undefined, decimals = 4): string {
  if (!wei || wei === 0n) return "0";
  const divisor = 10n ** 18n;
  const whole = wei / divisor;
  const fraction = wei % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, decimals);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

/**
 * Format a bigint as a compact human-readable string (e.g. 1.2M).
 */
export function formatCompact(value: bigint | undefined): string {
  if (!value) return "0";
  const num = Number(value) / 1e18;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Truncate an Ethereum address for display.
 */
export function truncateAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a timestamp to a readable date.
 */
export function formatTimestamp(timestamp: bigint | undefined): string {
  if (!timestamp || timestamp === 0n) return "Never";
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate APY percentage from basis points.
 */
export function apyFromBps(bps: bigint | undefined): string {
  if (!bps) return "0";
  return (Number(bps) / 100).toFixed(1);
}
