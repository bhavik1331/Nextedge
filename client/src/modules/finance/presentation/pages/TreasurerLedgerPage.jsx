import React, { useCallback, useEffect, useState } from "react";
import { treasurerUseCases } from "../../application/treasurer.usecases";
import { toCurrency } from "../../domain/finance.constants";
import TablePagination from "../components/TablePagination";

const TreasurerLedgerPage = () => {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });

  const load = useCallback(async () => {
    const data = await treasurerUseCases.loadLedger({ page, limit });
    setEntries(data.entries || []);
    setPagination(data.pagination || { page: 1, limit, total: 0, pages: 1 });
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const addManual = async () => {
    const description = window.prompt("Description");
    if (!description) return;
    const amount = window.prompt("Amount", "0");
    if (!amount) return;
    const type = window.prompt("Type: CREDIT or DEBIT", "CREDIT");
    if (!type) return;
    await treasurerUseCases.createManualLedgerEntry({ description, amount: Number(amount), type: type.toUpperCase() });
    await load();
  };

  const reverse = async (id) => {
    const reason = window.prompt("Reversal reason");
    if (!reason) return;
    await treasurerUseCases.reverseLedgerEntry(id, { reason });
    await load();
  };

  const download = async (format) => {
    const blob = await treasurerUseCases.exportLedger(format);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${Date.now()}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Ledger</h1>
        <div className="space-x-2">
          <button onClick={() => download("csv")} className="rounded border border-slate-300 px-3 py-2 text-sm">Export CSV</button>
          <button onClick={() => download("pdf")} className="rounded border border-slate-300 px-3 py-2 text-sm">Export PDF</button>
          <button onClick={addManual} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add Manual Entry</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Debit</th>
              <th className="px-3 py-2">Credit</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{e.description}</td>
                <td className="px-3 py-2">{e.type === "DEBIT" ? toCurrency(e.amount) : "-"}</td>
                <td className="px-3 py-2">{e.type === "CREDIT" ? toCurrency(e.amount) : "-"}</td>
                <td className="px-3 py-2">{toCurrency(e.runningBalance)}</td>
                <td className="px-3 py-2">{!e.isReversed && <button onClick={() => reverse(e._id)} className="rounded border border-slate-300 px-2 py-1 text-xs">Reverse</button>}</td>
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

export default TreasurerLedgerPage;
