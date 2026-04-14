import React, { useEffect, useState } from "react";
import { toCurrency } from "../../domain/finance.constants";
import { treasurerUseCases } from "../../application/treasurer.usecases";

const Card = ({ title, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const TreasurerOverviewPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setOverview(await treasurerUseCases.loadOverview());
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <p>Loading financial overview...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Financial Overview</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Opening Balance" value={toCurrency(overview?.openingBalance)} />
        <Card title="Closing Balance" value={toCurrency(overview?.closingBalance)} />
        <Card title="Total Fees Collected" value={toCurrency(overview?.totalFeesCollected)} />
        <Card title="Pending Fees" value={toCurrency(overview?.pendingFees)} />
        <Card title="Total Members Paid" value={overview?.totalMembersPaid || 0} />
        <Card title="Pending Fund Requests" value={`${overview?.pendingFundRequestsCount || 0} (${toCurrency(overview?.pendingFundRequestsAmount)})`} />
      </div>
    </section>
  );
};

export default TreasurerOverviewPage;
