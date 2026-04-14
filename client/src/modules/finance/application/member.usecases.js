import { financeApi } from "../infrastructure/financeApi";

export const memberFinanceUseCases = {
  submitPayment: async (payload) => (await financeApi.submitPayment(payload)).data,
  loadMyPayments: async () => (await financeApi.getMyPayments()).data.payments,
  loadMyNotifications: async () => (await financeApi.getNotifications()).data.notifications,
  markNotificationRead: async (id) => (await financeApi.markNotificationRead(id)).data,
  markAllNotificationsRead: async () => (await financeApi.markAllNotificationsRead()).data,
  getReceipt: async (paymentId) => (await financeApi.getReceipt(paymentId)).data,
  submitFundRequest: async (payload) => (await financeApi.submitFundRequest(payload)).data,
  loadMyFundRequests: async () => (await financeApi.getMyFundRequests()).data.fundRequests,
};
