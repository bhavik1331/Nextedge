import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminEventForm from "../../../../pages/AdminEventForm";

const ClubHeadEventsPage = () => {
  const [key, setKey] = useState(0);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setKey((k) => k + 1);
    navigate("/club-head/events");
  };

  return (
    <section className="space-y-4">
      <div>
        <Link to="/club-head/events" className="text-sm text-slate-600 hover:underline">Back to Events</Link>
        <h1 className="mt-2 text-2xl font-bold">Create Event</h1>
      </div>
      <AdminEventForm key={key} onSuccess={handleSuccess} />
    </section>
  );
};

export default ClubHeadEventsPage;
