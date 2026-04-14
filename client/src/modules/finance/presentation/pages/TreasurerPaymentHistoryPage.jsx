import React, { useCallback, useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import StatusBadge from "../components/StatusBadge";
import { toCurrency } from "../../domain/finance.constants";
import TablePagination from "../components/TablePagination";

const TreasurerPaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    mode: "",
    memberName: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
  });

  const load = useCallback(async () => {
    const response = await treasurerUseCases.loadPayments({
      ...filters,
      page,
      limit,
    });
    setPayments(response.payments || []);
    setPagination(
      response.pagination || { page: 1, limit, total: 0, pages: 1 },
    );
  }, [filters, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (format) => {
    const blob = await treasurerUseCases.exportPayments({ ...filters, format });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <div className="space-x-2">
          <button
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            onClick={() => download("csv")}
          >
            Export CSV
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            onClick={() => download("pdf")}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) =>
            setFilters((s) => ({ ...s, status: e.target.value }))
          }
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={filters.mode}
          onChange={(e) => setFilters((s) => ({ ...s, mode: e.target.value }))}
        >
          <option value="">All Modes</option>
          <option value="ONLINE">Online</option>
          <option value="CASH">Cash</option>
        </select>
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search member name"
          value={filters.memberName}
          onChange={(e) =>
            setFilters((s) => ({ ...s, memberName: e.target.value }))
          }
        />
        <button
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
          onClick={() => setPage(1)}
        >
          Apply Filters
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Member</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Transaction ID</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actioned By</th>
              <th className="px-3 py-2">Proof</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Actioned</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {p.memberId?.name || p.memberId?.email || "-"}
                </td>
                <td className="px-3 py-2">{toCurrency(p.amount)}</td>
                <td className="px-3 py-2">{p.mode || p.paymentType || "-"}</td>
                <td className="px-3 py-2">{p.transactionId || "-"}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-2">{p.approvedByName || "-"}</td>
                <td className="px-3 py-2">
                  {p.proofUrl ? (
                    <a
                      href={p.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2">
                  {p.treasurerNote || p.rejectionReason || p.notes || "-"}
                </td>
                <td className="px-3 py-2">
                  {new Date(p.submittedAt || p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  {p.actionedAt
                    ? new Date(p.actionedAt).toLocaleDateString()
                    : "-"}
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

export default TreasurerPaymentHistoryPage;
