import { useEffect, useState } from "react";
import { api } from "../../../../api/axios";

const ClubHeadMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/members");
      setMembers(res.data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const createMember = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/members", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setName("");
      setEmail("");
      setPassword("");
      setMessage("Member added successfully.");
      fetchMembers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add member.");
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Members</h1>

      <form
        className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3"
        onSubmit={createMember}
      >
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Member email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          type="password"
          placeholder="Temporary password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white md:col-span-3">
          Add Member
        </button>
        {message && (
          <p className="text-sm text-slate-600 md:col-span-3">{message}</p>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Loading members...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  No members found.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m._id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{m.name || "-"}</td>
                  <td className="px-3 py-2">{m.email}</td>
                  <td className="px-3 py-2">{m.role}</td>
                  <td className="px-3 py-2">
                    {m.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ClubHeadMembersPage;
