import { financeApi } from "../infrastructure/financeApi";

export const treasurerUseCases = {
  loadOverview: async () => (await financeApi.getOverview()).data.overview,
  loadMemberFees: async (params) =>
    (await financeApi.getMemberFees(params)).data.members,
  exportMemberFees: async (params) =>
    (await financeApi.exportMemberFees(params)).data,
  markMemberPaid: async (memberId, payload) =>
    (await financeApi.markMemberPaid(memberId, payload)).data,
  sendReminder: async (memberId) =>
    (await financeApi.sendReminder(memberId)).data,

  loadPayments: async (params) => (await financeApi.getPayments(params)).data,
  exportPayments: async (params) =>
    (await financeApi.exportPayments(params)).data,
  approvePayment: async (id, payload) =>
    (await financeApi.approvePayment(id, payload)).data,
  rejectPayment: async (id, payload) =>
    (await financeApi.rejectPayment(id, payload)).data,
  clarifyPayment: async (id, payload) =>
    (await financeApi.clarifyPayment(id, payload)).data,

  loadLedger: async (params) => (await financeApi.getLedger(params)).data,
  exportLedger: async (format) => (await financeApi.exportLedger(format)).data,
  createManualLedgerEntry: async (payload) =>
    (await financeApi.addManualLedgerEntry(payload)).data,
  reverseLedgerEntry: async (id, payload) =>
    (await financeApi.reverseLedgerEntry(id, payload)).data,

  loadFundRequests: async (params) =>
    (await financeApi.getFundRequests(params)).data,
  approveFundRequest: async (id, payload) =>
    (await financeApi.approveFundRequest(id, payload)).data,
  rejectFundRequest: async (id, payload) =>
    (await financeApi.rejectFundRequest(id, payload)).data,
  releaseFundRequest: async (id, payload) =>
    (await financeApi.releaseFundRequest(id, payload)).data,

  loadExpenses: async (params) => (await financeApi.getExpenses(params)).data,
  createExpense: async (payload) =>
    (await financeApi.createExpense(payload)).data,
  reverseExpense: async (id, payload) =>
    (await financeApi.reverseExpense(id, payload)).data,

  loadReports: async () => {
    const [fees, expenses, funds, ledger] = await Promise.all([
      financeApi.reportFeeCollection(),
      financeApi.reportExpenses(),
      financeApi.reportFundRequests(),
      financeApi.reportLedger(),
    ]);

    return {
      monthlyFeeCollection: fees.data.monthlyFeeCollection || [],
      expenseBreakdown: expenses.data.expenseBreakdown || [],
      fundRequestSummary: funds.data.fundRequestSummary || [],
      ledgerEntries: ledger.data.entries || [],
    };
  },

  loadSummary: async (params) =>
    (await financeApi.reportSummary(params)).data.summary,

  loadNotifications: async () =>
    (await financeApi.getNotifications()).data.notifications,
  markNotificationRead: async (id) =>
    (await financeApi.markNotificationRead(id)).data,
  markAllNotificationsRead: async () =>
    (await financeApi.markAllNotificationsRead()).data,
};
