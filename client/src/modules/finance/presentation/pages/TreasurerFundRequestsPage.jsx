import React, { useCallback, useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import StatusBadge from "../components/StatusBadge";
import { toCurrency } from "../../domain/finance.constants";
import TablePagination from "../components/TablePagination";

const TreasurerFundRequestsPage = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const load = useCallback(async () => {
    const response = await treasurerUseCases.loadFundRequests({ page, limit });
    setRows(response.fundRequests || []);
    setPagination(response.pagination || { page: 1, limit, total: 0, pages: 1 });
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    await treasurerUseCases.approveFundRequest(id, {});
    await load();
  };

  const reject = async (id) => {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    await treasurerUseCases.rejectFundRequest(id, { reason });
    await load();
  };

  const release = async (id, suggestedAmount) => {
    const amountReleased = window.prompt("Amount to release", String(suggestedAmount || 0));
    if (!amountReleased) return;
    await treasurerUseCases.releaseFundRequest(id, { amountReleased: Number(amountReleased) });
    await load();
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Fund Request Management</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Club</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Requested</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Requested By</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fr) => (
              <tr key={fr._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{fr.clubName}</td>
                <td className="px-3 py-2">{fr.eventName}</td>
                <td className="px-3 py-2">{toCurrency(fr.amountRequested)}</td>
                <td className="px-3 py-2"><StatusBadge status={fr.status} /></td>
                <td className="px-3 py-2">{fr.requestedByName}</td>
                <td className="px-3 py-2 space-x-2">
                  <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => approve(fr._id)}>Approve</button>
                  <button className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={() => reject(fr._id)}>Reject</button>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs" onClick={() => release(fr._id, fr.amountRequested)}>Release</button>
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

export default TreasurerFundRequestsPage;
