import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Save, Search, Filter, ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminAttendancePage = () => {
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [eventsRes, membersRes] = await Promise.all([
                api.get('/events'),
                api.get('/members')
            ]);
            
            if (eventsRes.data) {
                // Adjust based on API structure (could be res.data or res.data.events)
                const eventList = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.events || []);
                setEvents(eventList);
            }
            if (membersRes.data.success) {
                setMembers(membersRes.data.members);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchAttendance = async () => {
        if (!selectedEvent) return;
        try {
            setLoading(true);
            const res = await api.get(`/attendance?event_id=${selectedEvent}&date=${selectedDate}`);
            
            if (res.data.success) {
                // Map existing records to the member list
                const existingRecords = res.data.attendance;
                const newRecords = members.map(m => {
                    const existing = existingRecords.find(r => r.member._id === m._id);
                    return {
                        member_id: m._id,
                        name: m.name,
                        email: m.email,
                        status: existing ? existing.status : 'Absent',
                        notes: existing ? existing.notes : '',
                        exists: !!existing
                    };
                });
                setAttendanceRecords(newRecords);
                updateSimpleStats(newRecords);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEvent && selectedDate) {
            fetchAttendance();
        }
    }, [selectedEvent, selectedDate]);

    const updateSimpleStats = (records) => {
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        setStats({ present, absent });
    };

    const handleStatusChange = (memberId, newStatus) => {
        const updated = attendanceRecords.map(r => 
            r.member_id === memberId ? { ...r, status: newStatus } : r
        );
        setAttendanceRecords(updated);
        updateSimpleStats(updated);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await api.post('/attendance', {
                event_id: selectedEvent,
                date: selectedDate,
                records: attendanceRecords.map(r => ({
                    member_id: r.member_id,
                    status: r.status,
                    notes: r.notes
                }))
            });

            if (res.data.success) {
                alert('Attendance saved successfully!');
                fetchAttendance();
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRecords = attendanceRecords.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportToCSV = () => {
        const eventName = events.find(e => e._id === selectedEvent)?.title || 'Event';
        const headers = ["Member Name", "Email", "Status", "Date", "Event"];
        const rows = attendanceRecords.map(r => [
            r.name,
            r.email,
            r.status,
            selectedDate,
            eventName
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${eventName}_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                
                {/* Back Button */}
                <Link to="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-indigo-500 mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> Back to Panel
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight italic uppercase">Attendance Control</h1>
                                <p className="text-muted-foreground font-medium">Coordinate and log participation for your squad</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                             <CheckCircle className="w-4 h-4" />
                             <span className="text-sm font-black uppercase tracking-widest">{stats.present} P</span>
                        </div>
                        <div className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl border border-rose-500/20 flex items-center gap-3">
                             <XCircle className="w-4 h-4" />
                             <span className="text-sm font-black uppercase tracking-widest">{stats.absent} A</span>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-card rounded-2xl border border-border p-8 shadow-xl space-y-8 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select Active Event</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <select 
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                >
                                    <option value="">Choose an event...</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Marking Date</label>
                            <input 
                                type="date" 
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end gap-3">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !selectedEvent}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Commit Changes
                            </button>
                            <button 
                                onClick={exportToCSV}
                                disabled={attendanceRecords.length === 0}
                                className="p-3.5 bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all text-foreground disabled:opacity-50"
                                title="Export CSV"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                {selectedEvent ? (
                    <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="text" 
                                    placeholder="Search members by name or email..."
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border">
                                {['ALL', 'Present', 'Absent'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setStatusFilter(type)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            statusFilter === type 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/30">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Officer / Member</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Contact</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Participation Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <AnimatePresence>
                                        {filteredRecords.map((record) => (
                                            <motion.tr 
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={record.member_id} 
                                                className="hover:bg-muted/20 transition-colors group"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm uppercase border border-indigo-500/20">
                                                            {record.name.substring(0, 1)}
                                                        </div>
                                                        <span className="font-bold text-sm tracking-tight">{record.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-medium text-muted-foreground italic">{record.email}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <button 
                                                            onClick={() => handleStatusChange(record.member_id, 'Present')}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                record.status === 'Present' 
                                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }`}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Present
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(record.member_id, 'Absent')}
                                                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                record.status === 'Absent' 
                                                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
                                                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }`}
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Absent
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add brief note..."
                                                        className="bg-transparent border-b border-border text-xs focus:border-indigo-500 outline-none py-1 w-full italic text-muted-foreground"
                                                        value={record.notes}
                                                        onChange={(e) => {
                                                            const updated = attendanceRecords.map(r => 
                                                                r.member_id === record.member_id ? { ...r, notes: e.target.value } : r
                                                            );
                                                            setAttendanceRecords(updated);
                                                        }}
                                                    />
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl border-2 border-dashed border-border p-20 text-center space-y-4">
                        <div className="inline-flex p-6 bg-muted rounded-full text-muted-foreground/30 mb-4">
                            <Calendar className="w-16 h-16" />
                        </div>
                        <h2 className="text-2xl font-bold italic uppercase tracking-tight">Deployment Ready</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Select an event and date from the dashboard above to begin marking attendance for the session.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendancePage;
