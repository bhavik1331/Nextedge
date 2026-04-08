import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CalendarDays,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/axios";

// Reuseable Stat Card component
const StatCard = ({ title, value, icon: Icon, color, percentage, label }) => (
  <div className="bg-card p-6 lg:p-8 rounded-2xl border border-border shadow-md flex items-start gap-4 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
    <div className={`p-4 rounded-xl ${color} bg-opacity-20 text-indigo-500 shadow-sm transition-colors`}>
      <Icon className="w-6 h-6" />
    </div>
    
    <div>
       <p className="text-muted-foreground text-sm font-medium mb-1 tracking-wide uppercase">{title}</p>
       <h3 className="text-3xl font-bold text-foreground mb-2 leading-none">{value}</h3>
       <div className="flex items-center gap-1.5 min-h-[20px]">
          <span className="text-indigo-400 text-xs font-bold font-mono py-0.5 px-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">{percentage}</span>
          <p className="text-muted-foreground text-[11px] font-medium leading-tight">{label}</p>
       </div>
    </div>

    {/* Subtle gradient overlay on hover */}
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 blur-3xl pointer-events-none rounded-full bg-indigo-500`}></div>
  </div>
);

const DashboardOverview = () => {
  const { member } = useAuth();
  const [stats, setStats] = useState({
    totalEventsJoined: 0,
    attendancePercentage: 0,
    pendingPayments: 0,
    recentNotificationsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Sample data for charts (would come from actual API analytics)
  const attendanceData = [
    { name: "Jan", attendance: 65 },
    { name: "Feb", attendance: 59 },
    { name: "Mar", attendance: 80 },
    { name: "Apr", attendance: 81 },
    { name: "May", attendance: 76 },
    { name: "Jun", attendance: 95 },
  ];

  const paymentData = [
    { name: "Membership", value: 1000 },
    { name: "Event A", value: 500 },
    { name: "Event B", value: 300 },
    { name: "Workshop", value: 800 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/members/dashboard-stats");
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border h-40 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-[450px] bg-card border border-border rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="mb-12 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">{member?.name || "Member"}</span>! 👋
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-normal leading-relaxed">
              Welcome back to your <span className="text-indigo-400 font-semibold italic">NextEdge Society</span> control center. Here's a look at your current club status and recent activity.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-3 rounded-2xl transition-transform hover:scale-105 duration-300">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-indigo-500 dark:text-indigo-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/5 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/5 blur-[100px] rounded-full -z-10"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Events Joined"
          value={stats.totalEventsJoined}
          icon={CalendarDays}
          color="bg-blue-600"
          percentage="+12%"
          label="This month"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendancePercentage}%`}
          icon={CheckCircle}
          color="bg-emerald-600"
          percentage="+5%"
          label="Above Avg"
        />
        <StatCard
          title="Pending Dues"
          value={stats.pendingPayments}
          icon={Clock}
          color="bg-amber-600"
          percentage="Alert"
          label="Payment due soon"
        />
        <StatCard
          title="Notifications"
          value={stats.recentNotificationsCount}
          icon={Bell}
          color="bg-indigo-600"
          percentage="New"
          label="Check inbox"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-xl font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              Attendance Timeline
            </h4>
            <select className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full mt-4 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#555" 
                  fontSize={12} 
                  fontWeight={500} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                />
                <YAxis 
                   stroke="#555" 
                   fontSize={12} 
                   fontWeight={500} 
                   tickLine={false} 
                   axisLine={false} 
                   dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                  itemStyle={{ color: "#818cf8" }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorAttendance)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Side Card */}
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg flex flex-col relative group">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-foreground flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Recent Activity
            </h4>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-500/20 transition-colors">View All</span>
          </div>
          
          <div className="space-y-6 flex-1">
            {[
              { title: "Event Registered", time: "2 hours ago", desc: "Digital Innovations Showcase 2024", type: "success" },
              { title: "Payment Received", time: "1 day ago", desc: "Annual Membership Fee #4492", type: "info" },
              { title: "Profile Updated", time: "3 days ago", desc: "Contact information changed", type: "default" },
              { title: "New Notification", time: "5 days ago", desc: "Welcome to NextEdge Society!", type: "info" }
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${activity.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
                  {idx !== 3 && <div className="absolute top-4 left-[5.5px] w-[1px] h-12 bg-border"></div>}
                </div>
                <div>
                   <p className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors">{activity.title}</p>
                   <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{activity.desc}</p>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-4 bg-muted border border-border text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-all hover:border-indigo-500/30 flex items-center justify-center gap-3 shadow-md active:scale-95 duration-200">
            Download Report
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
