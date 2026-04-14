import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { treasurerUseCases } from "../../application/treasurer.usecases";

const TreasurerReportsPage = () => {
  const [data, setData] = useState({
    monthlyFeeCollection: [],
    expenseBreakdown: [],
    fundRequestSummary: [],
    ledgerEntries: [],
  });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      setData(await treasurerUseCases.loadReports());
    };
    load();
  }, []);

  const balanceTrend = useMemo(() => {
    return (data.ledgerEntries || []).slice(-12).map((e) => ({
      date: new Date(e.date).toLocaleDateString(),
      balance: e.runningBalance,
    }));
  }, [data.ledgerEntries]);

  const loadSummary = async () => {
    if (!from || !to) return;
    const response = await treasurerUseCases.loadSummary({ from, to });
    setSummary(response);
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input className="rounded border border-slate-300 px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="rounded border border-slate-300 px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={loadSummary}>Load Date Range Summary</button>
          <div className="rounded bg-slate-50 px-3 py-2 text-sm">
            {summary ? `Credit: ${summary.totalCredit} | Debit: ${summary.totalDebit} | Net: ${summary.net}` : "Select dates to view summary"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold">Monthly Fee Collection</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyFeeCollection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold">Expense Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expenseBreakdown} dataKey="total" nameKey="category" outerRadius={90} fill="#334155" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold">Net Balance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#15803d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-semibold">Fund Requests Summary</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fundRequestSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clubName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requested" fill="#0f172a" />
                <Bar dataKey="released" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TreasurerReportsPage;
