export const EXPIRY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function expiryFromUpload(uploadDate) {
  const base = uploadDate ? new Date(uploadDate) : new Date();
  return new Date(base.getTime() + EXPIRY_DAYS * DAY_MS).toISOString();
}

export function daysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const end = new Date(expiryDate).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / DAY_MS);
}

/**
 * Label + tone for a listing's 30-day expiry.
 * tone: calm | soon | urgent | expired
 */
export function expiryMeta(expiryDate) {
  const days = daysRemaining(expiryDate);
  if (days === null) return { days: null, label: "No expiry", tone: "calm" };
  if (days <= 0) return { days, label: "Expired", tone: "expired" };
  if (days === 1) return { days, label: "1 day remaining", tone: "urgent" };
  if (days <= 3) return { days, label: `${days} days remaining`, tone: "urgent" };
  if (days <= 7) return { days, label: `${days} days remaining`, tone: "soon" };
  return { days, label: `${days} days left`, tone: "calm" };
}

export function parsePrice(value) {
  const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : NaN;
}