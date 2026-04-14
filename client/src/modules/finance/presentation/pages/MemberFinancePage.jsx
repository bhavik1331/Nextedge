import React, { useEffect, useState } from "react";
import { memberFinanceUseCases } from "../../application/member.usecases";
import StatusBadge from "../components/StatusBadge";
import { toCurrency } from "../../domain/finance.constants";

const MemberFinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    mode: "ONLINE",
    transactionId: "",
    purpose: "Membership Fee",
  });
  const [proofFile, setProofFile] = useState(null);

  const load = async () => {
    const [myPayments, myNotifications] = await Promise.all([
      memberFinanceUseCases.loadMyPayments(),
      memberFinanceUseCases.loadMyNotifications(),
    ]);
    setPayments(myPayments);
    setNotifications(myNotifications);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (proofFile && proofFile.size > 5 * 1024 * 1024) {
      window.alert("Proof file must be 5MB or less.");
      return;
    }
    const payload = new FormData();
    payload.append("amount", form.amount);
    payload.append("mode", form.mode);
    payload.append("transactionId", form.transactionId);
    payload.append("purpose", form.purpose);
    if (proofFile) payload.append("proofFile", proofFile);
    await memberFinanceUseCases.submitPayment(payload);
    setForm({
      amount: "",
      mode: "ONLINE",
      transactionId: "",
      purpose: "Membership Fee",
    });
    setProofFile(null);
    await load();
  };

  const openReceipt = async (paymentId) => {
    const data = await memberFinanceUseCases.getReceipt(paymentId);
    if (data?.receiptUrl)
      window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
  };

  const markRead = async (id) => {
    await memberFinanceUseCases.markNotificationRead(id);
    await load();
  };

  const markAllRead = async () => {
    await memberFinanceUseCases.markAllNotificationsRead();
    await load();
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Member Payments & Receipts</h1>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
      >
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
          required
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.mode}
          onChange={(e) => setForm((s) => ({ ...s, mode: e.target.value }))}
        >
          <option value="ONLINE">Online</option>
          <option value="CASH">Cash</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Transaction ID"
          value={form.transactionId}
          onChange={(e) =>
            setForm((s) => ({ ...s, transactionId: e.target.value }))
          }
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => setForm((s) => ({ ...s, purpose: e.target.value }))}
        />
        <input
          className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white md:col-span-2">
          Submit Payment
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Payment History</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{toCurrency(p.amount)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-2">
                      {p.receiptUrl ? (
                        <button
                          className="text-blue-700 underline"
                          onClick={() => openReceipt(p._id)}
                        >
                          Download
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              className="rounded border border-slate-300 px-2 py-1 text-xs"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <article
                key={n._id}
                className={`rounded-lg border p-3 ${n.isRead ? "border-slate-200" : "border-blue-200 bg-blue-50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{n.subject}</p>
                    <p className="text-sm text-slate-600">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
                      onClick={() => markRead(n._id)}
                    >
                      Read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberFinancePage;
