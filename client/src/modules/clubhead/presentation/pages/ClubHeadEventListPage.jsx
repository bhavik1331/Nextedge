import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../api/axios.js";
import AdminEventTable from "../../../../pages/AdminEventTable";
import AdminEventEditModal from "../../../../pages/AdminEventEditModal";

const ClubHeadEventListPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    const res = await api.get("/events");
    const list = res.data.events || [];
    const now = new Date();
    const getStart = (e) => new Date(e.eventStartDate || e.date);
    const upcoming = list
      .filter((e) => getStart(e) >= now)
      .sort((a, b) => getStart(a) - getStart(b));
    const past = list
      .filter((e) => getStart(e) < now)
      .sort((a, b) => getStart(b) - getStart(a));
    setEvents([...upcoming, ...past]);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/club-head/event-form"
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Create Event
          </Link>
          <Link
            to="/club-head/members"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            Members
          </Link>
          <Link
            to="/club-head/fund-requests"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            Fund Requests
          </Link>
        </div>
      </div>

      <AdminEventTable
        events={events}
        onEdit={setSelectedEvent}
        onDelete={fetchEvents}
        registrationsBasePath="/club-head/events"
      />

      {selectedEvent && (
        <AdminEventEditModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={fetchEvents}
        />
      )}
    </section>
  );
};

export default ClubHeadEventListPage;
