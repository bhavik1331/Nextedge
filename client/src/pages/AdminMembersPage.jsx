import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios.js";
import { Users, ArrowLeft, PlusCircle, Loader2, Mail, Lock } from "lucide-react";

const AdminMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedName) {
      setMessage({ type: "error", text: "Name is required." });
      return;
    }
    if (!trimmedEmail) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }
    if (!password || password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    
    setCreateLoading(true);
    try {
      await api.post("/members", { name: trimmedName, email: trimmedEmail, password });
      setMessage({ type: "success", text: "Member account created. Share the login link and password with them." });
      setName("");
      setEmail("");
      setPassword("");
      fetchMembers();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create member.",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:mt-14 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Member accounts can log in at <strong>/member-login</strong> to register for members-only events.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Add member
            </h2>
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              {message.text && (
                <p
                  className={`text-sm p-3 rounded-lg ${
                    message.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}
                >
                  {message.text}
                </p>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Give them a temporary password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  autoComplete="off"
                />
              </div>
              
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  "Create member account"
                )}
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700">
              Member accounts ({members.length})
            </h2>
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : members.length === 0 ? (
              <p className="p-6 text-gray-500 dark:text-gray-400">
                No member accounts yet. Add one above.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                    <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m._id} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{m.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{m.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={m.role}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if(window.confirm(`Are you sure you want to promote ${m.email} to ${newRole}?`)) {
                              try {
                                await api.put(`/members/${m._id}/role`, { role: newRole });
                                fetchMembers(); // Refresh List
                              } catch(error) {
                                alert(error.response?.data?.message || "Failed to assign role.");
                              }
                            }
                          }}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="CLUB_HEAD">Club Head</option>
                          <option value="TREASURER">Treasurer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleDateString(undefined, {
                              dateStyle: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminMembersPage;
