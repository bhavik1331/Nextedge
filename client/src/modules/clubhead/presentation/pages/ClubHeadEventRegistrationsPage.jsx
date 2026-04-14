import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../../../api/axios.js";

const ClubHeadEventRegistrationsPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, regRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/events/${eventId}/registrations`),
        ]);
        setEvent(eventRes.data?.event ?? null);
        setRegistrations(regRes.data?.registrations ?? []);
      } catch {
        setEvent(null);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  if (loading) return <p>Loading registrations...</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <section className="space-y-4">
      <Link
        to="/club-head/events"
        className="text-sm text-slate-600 hover:underline"
      >
        Back to Events
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Registrations</h1>
        <p className="text-sm text-slate-600">{event.title}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Registered</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">
                  {r.type === "member" ? "Member" : "Guest"}
                </td>
                <td className="px-3 py-2">
                  {r.registrationTimestamp
                    ? new Date(r.registrationTimestamp).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  No registrations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ClubHeadEventRegistrationsPage;
