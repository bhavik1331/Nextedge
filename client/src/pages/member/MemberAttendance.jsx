import React, { useState, useEffect } from "react";
import { UserCheck, Search, Filter, CheckCircle2, XCircle, Clock, Calendar, Download, ChevronRight } from "lucide-react";
import { api } from "../../api/axios";

const MemberAttendance = () => {
  const [attendance, setAttendance] = useState([
    // Mock data for initial UI build
    { id: 1, eventName: "Digital Innovation Workshop", date: "2024-03-15", status: "Attended", type: "Workshop" },
    { id: 2, eventName: "Annual General Meeting", date: "2024-03-20", status: "Absent", type: "Meeting" },
    { id: 3, eventName: "Coding Bootcamp Day 1", date: "2024-04-02", status: "Attended", type: "Training" },
    { id: 4, eventName: "Networking Night", date: "2024-04-10", status: "Attended", type: "Social" },
    { id: 5, eventName: "Spring Hackathon 2024", date: "2024-04-15", status: "Attended", type: "Hackathon" },
  ]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    // In a real implementation: fetch from /members/attendance
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const StatusBadge = ({ status }) => {
    const styles = {
      Attended: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
      Absent: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10",
      Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10",
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold border-2 shadow-sm uppercase tracking-widest flex items-center gap-2 w-fit ${styles[status]}`}>
        {status === 'Attended' ? <CheckCircle2 className="w-3.5 h-3.5" /> : status === 'Absent' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-gray-900 border border-gray-800 rounded-3xl"></div>
        <div className="h-[600px] bg-gray-900 border border-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-800/50">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4 group">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl group-hover:scale-105 transition-transform duration-500">
               <UserCheck className="w-8 h-8 text-indigo-500" />
            </div>
            Attendance History
          </h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Keep track of your participation and activity levels.</p>
        </div>
        
        <button className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 active:scale-95 duration-200">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0f0f0f] rounded-[3rem] border border-gray-800 shadow-3xl overflow-hidden relative group/table">
        {/* Table Background Decorative Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[120px] -z-10 rounded-full opacity-0 group-hover/table:opacity-100 transition-opacity duration-1000"></div>

        {/* Filters/Actions Bar */}
        <div className="p-8 border-b border-gray-800/50 flex flex-col md:flex-row justify-between gap-6 items-center bg-[#0a0a0a]/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by event or activity..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#0f0f0f] border border-gray-800 rounded-2xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium placeholder-gray-600"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer group/label">
                <Filter className="w-4 h-4 text-indigo-400 group-hover/label:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-bold text-gray-400 group-hover/label:text-white">Filter Status</span>
             </div>
             
             <select 
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value)}
               className="bg-gray-900 border border-gray-800 text-gray-300 text-sm font-bold rounded-2xl px-6 py-3.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:border-gray-700"
             >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
             </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-gray-800 border-dashed">
                <th className="py-7 px-10 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Activity / Event Title</th>
                <th className="py-7 px-10 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Category</th>
                <th className="py-7 px-10 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Date Recorded</th>
                <th className="py-7 px-10 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Attendance Status</th>
                <th className="py-7 px-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {attendance.map((row, idx) => (
                <tr key={idx} className="group hover:bg-indigo-600/[0.03] transition-all cursor-pointer duration-200">
                  <td className="py-8 px-10">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all duration-300 shadow-lg">
                          <Calendar className="w-6 h-6" />
                       </div>
                       <div>
                         <span className="block text-white font-extrabold group-hover:text-indigo-400 transition-colors text-lg tracking-tight mb-0.5">{row.eventName}</span>
                         <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-800">Event #{row.id + 1024}</span>
                       </div>
                    </div>
                  </td>
                  <td className="py-8 px-10 py-1.5 px-3">
                    <span className="text-sm font-bold text-gray-300 bg-gray-900/80 px-4 py-2 rounded-xl border border-gray-800/50">{row.type}</span>
                  </td>
                  <td className="py-8 px-10">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-white mb-0.5">{new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                       <span className="text-[10px] text-gray-500 font-bold font-mono tracking-widest uppercase">Verified</span>
                    </div>
                  </td>
                  <td className="py-8 px-10">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-8 px-10 text-right">
                    <button className="p-3 text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all group-hover:translate-x-1 duration-300">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-10 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#0a0a0a]/30">
          <div className="text-sm font-medium text-gray-500">
            Showing <span className="text-white font-bold">1 - 5</span> of <span className="text-white font-bold">24</span> verified participation records
          </div>
          
          <div className="flex items-center space-x-3">
             <button className="px-6 py-3 bg-gray-900 border border-gray-800 text-gray-400 rounded-2xl font-bold text-xs hover:text-white hover:bg-gray-800 transition-all cursor-not-allowed uppercase tracking-widest leading-none">Previous</button>
             <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(p => (
                   <button key={p} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${p === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0a0a]' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                      {p}
                   </button>
                ))}
             </div>
             <button className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest leading-none shadow-md">Next Page</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAttendance;
