import React, { useCallback, useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import StatusBadge from "../components/StatusBadge";
import { toCurrency } from "../../domain/finance.constants";
import TablePagination from "../components/TablePagination";

const TreasurerApprovalsPage = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const load = useCallback(async () => {
    const response = await treasurerUseCases.loadPayments({ status: "PENDING", page, limit });
    setPayments(response.payments || []);
    setPagination(response.pagination || { page: 1, limit, total: 0, pages: 1 });
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    await treasurerUseCases.approvePayment(id, {});
    await load();
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    await treasurerUseCases.rejectPayment(id, { reason });
    await load();
  };

  const clarify = async (id) => {
    const note = window.prompt("Clarification note");
    if (!note) return;
    await treasurerUseCases.clarifyPayment(id, { note });
    await load();
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Fee Approvals</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Proof</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{payment.memberId?.name || payment.memberId?.email || "Member"}</td>
                <td className="px-3 py-2">{toCurrency(payment.amount)}</td>
                <td className="px-3 py-2">{payment.mode || payment.paymentType || "-"}</td>
                <td className="px-3 py-2">{payment.proofUrl ? <a className="text-blue-700 underline" target="_blank" rel="noreferrer" href={payment.proofUrl}>View</a> : "-"}</td>
                <td className="px-3 py-2"><StatusBadge status={payment.status} /></td>
                <td className="px-3 py-2 space-x-2">
                  <button onClick={() => approve(payment._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">Approve</button>
                  <button onClick={() => reject(payment._id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Reject</button>
                  <button onClick={() => clarify(payment._id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Clarify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
      />
    </section>
  );
};

export default TreasurerApprovalsPage;
