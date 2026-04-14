export const PAYMENT_STATUSES = [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "CLARIFICATION_NEEDED",
];

export const FUND_REQUEST_STATUSES = [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "RELEASED",
];

export const EXPENSE_CATEGORIES = ["EVENT", "OPERATIONS", "EQUIPMENT", "MISC"];

export const STATUS_COLORS = {
  APPROVED: "bg-emerald-100 text-emerald-800",
  RELEASED: "bg-emerald-100 text-emerald-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  SUBMITTED: "bg-amber-100 text-amber-800",
  REJECTED: "bg-red-100 text-red-800",
  CLARIFICATION_NEEDED: "bg-blue-100 text-blue-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Partial: "bg-orange-100 text-orange-800",
};

export const toCurrency = (amount) => {
  const n = Number(amount || 0);
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

export const normalizeStatus = (status) => String(status || "").toUpperCase();
