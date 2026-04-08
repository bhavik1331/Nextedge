import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle, Percent, Clock, Filter, Search, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { motion } from 'framer-motion';

const MemberAttendance = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, attendancePercentage: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/attendance/my');
            if (res.data.success) {
                setHistory(res.data.history);
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(h => 
        h.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Absent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Excused': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-40 bg-card rounded-2xl border border-border"></div>
                <div className="h-96 bg-card rounded-2xl border border-border"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 bg-background text-foreground min-h-screen">
            <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Header & Stats Overview */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight italic uppercase flex items-center gap-3">
                            <CalendarDays className="w-8 h-8 text-indigo-500" />
                            Attendance Logs
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">Track your participation across society events</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Score</p>
                                <p className="text-xl font-bold">{stats.attendancePercentage}%</p>
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Present</p>
                                <p className="text-xl font-bold">{stats.present}</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex bg-card p-4 rounded-xl border border-border shadow-sm items-center gap-4">
                            <div className="p-3 bg-muted rounded-lg text-muted-foreground">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total</p>
                                <p className="text-xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search by event..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        
                        <div className="text-sm font-medium text-muted-foreground italic">
                            Showing {filteredHistory.length} records
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dated</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((record, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={record._id} 
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                                                        {record.event?.title?.substring(0, 2) || 'EV'}
                                                    </div>
                                                    <span className="font-bold text-sm tracking-tight">{record.event?.title || 'Unknown Event'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-mono text-muted-foreground">
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                                                    {record.notes || '---'}
                                                </p>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <AlertCircle className="w-10 h-10 opacity-20" />
                                                <p className="font-bold tracking-tight uppercase text-xs">No attendance records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Attendance Insight Tip */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-600/20">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg leading-tight tracking-tight">Requirement Policy</h4>
                            <p className="text-white/70 text-sm font-medium">Maintain at least 75% attendance to qualify for core committee roles.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-white/90 transition-all flex items-center gap-2">
                        View More Rules <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MemberAttendance;
