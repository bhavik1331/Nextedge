import { api } from "../../../api/axios";

export const financeApi = {
  getOverview: () => api.get("/finance/overview"),

  getMemberFees: (params = {}) => api.get("/finance/members", { params }),
  markMemberPaid: (memberId, payload) => api.patch(`/finance/members/${memberId}/fee-status`, payload),
  sendReminder: (memberId) => api.post(`/finance/members/${memberId}/reminder`),
  exportMemberFees: (params = {}) => api.get("/finance/members/export", { params, responseType: "blob" }),

  submitPayment: (payload) => api.post("/finance/payments", payload, { headers: { "Content-Type": "multipart/form-data" } }),
  getMyPayments: () => api.get("/finance/payments/member/me"),
  getPayments: (params = {}) => api.get("/finance/payments", { params }),
  exportPayments: (params = {}) =>
    api.get("/finance/payments/export", {
      params: { format: "csv", ...params },
      responseType: "blob",
    }),
  approvePayment: (id, payload = {}) => api.patch(`/finance/payments/${id}/approve`, payload),
  rejectPayment: (id, payload) => api.patch(`/finance/payments/${id}/reject`, payload),
  clarifyPayment: (id, payload) => api.patch(`/finance/payments/${id}/clarify`, payload),
  getReceipt: (id) => api.get(`/finance/payments/${id}/receipt`),

  getLedger: (params = {}) => api.get("/finance/ledger", { params }),
  exportLedger: (format = "csv") => api.get("/finance/ledger/export", { params: { format }, responseType: "blob" }),
  addManualLedgerEntry: (payload) => api.post("/finance/ledger/manual-entry", payload),
  reverseLedgerEntry: (id, payload) => api.post(`/finance/ledger/${id}/reverse`, payload),

  getFundRequests: (params = {}) => api.get("/finance/fund-requests", { params }),
  getMyFundRequests: () => api.get("/finance/fund-requests/mine"),
  submitFundRequest: (payload) => api.post("/finance/fund-requests", payload),
  approveFundRequest: (id, payload = {}) => api.patch(`/finance/fund-requests/${id}/approve`, payload),
  rejectFundRequest: (id, payload) => api.patch(`/finance/fund-requests/${id}/reject`, payload),
  releaseFundRequest: (id, payload) => api.patch(`/finance/fund-requests/${id}/release`, payload),

  getExpenses: (params = {}) => api.get("/finance/expenses", { params }),
  createExpense: (payload) => api.post("/finance/expenses", payload, { headers: { "Content-Type": "multipart/form-data" } }),
  updateExpense: (id, payload) => api.patch(`/finance/expenses/${id}`, payload),
  reverseExpense: (id, payload) => api.post(`/finance/expenses/${id}/reverse`, payload),

  reportFeeCollection: () => api.get("/finance/reports/fee-collection"),
  reportExpenses: () => api.get("/finance/reports/expenses"),
  reportFundRequests: () => api.get("/finance/reports/fund-requests"),
  reportLedger: () => api.get("/finance/reports/ledger"),
  reportSummary: (params) => api.get("/finance/reports/summary", { params }),

  getNotifications: () => api.get("/finance/notifications"),
  markNotificationRead: (id) => api.patch(`/finance/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch("/finance/notifications/read-all"),
};
