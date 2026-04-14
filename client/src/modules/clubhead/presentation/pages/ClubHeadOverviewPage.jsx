import React, { useEffect, useState } from "react";
import { api } from "../../../../api/axios";
import { memberFinanceUseCases } from "../../../finance/application/member.usecases";
import { toCurrency } from "../../../finance/domain/finance.constants";

const ClubHeadOverviewPage = () => {
  const [stats, setStats] = useState({
    eventsCount: 0,
    membersCount: 0,
    fundRequested: 0,
    fundReleased: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [eventsRes, membersRes, myFundRequests] = await Promise.all([
        api.get("/events"),
        api.get("/members"),
        memberFinanceUseCases.loadMyFundRequests(),
      ]);

      const fundRequested = (myFundRequests || []).reduce((sum, item) => sum + Number(item.amountRequested || 0), 0);
      const fundReleased = (myFundRequests || []).reduce((sum, item) => sum + Number(item.amountReleased || 0), 0);
      const pendingRequests = (myFundRequests || []).filter((item) => ["PENDING_APPROVAL", "SUBMITTED"].includes(String(item.status || "").toUpperCase())).length;

      setStats({
        eventsCount: (eventsRes.data?.events || []).length,
        membersCount: (membersRes.data?.members || []).length,
        fundRequested,
        fundReleased,
        pendingRequests,
      });
    };

    load();
  }, []);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Club Head Dashboard</h1>
      <p className="text-sm text-slate-600">Manage your club operations from one place.</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Events</p>
          <p className="mt-2 text-2xl font-bold">{stats.eventsCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Members</p>
          <p className="mt-2 text-2xl font-bold">{stats.membersCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Requested Funds</p>
          <p className="mt-2 text-2xl font-bold">{toCurrency(stats.fundRequested)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Released Funds</p>
          <p className="mt-2 text-2xl font-bold">{toCurrency(stats.fundReleased)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pending Requests</p>
          <p className="mt-2 text-2xl font-bold">{stats.pendingRequests}</p>
        </article>
      </div>
    </section>
  );
};

export default ClubHeadOverviewPage;
