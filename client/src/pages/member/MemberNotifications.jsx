import React, { useEffect, useState } from 'react';
import { Bell, Mail, Info, Filter, Calendar, MapPin, Clock, ChevronDown, Trash2 } from 'lucide-react';
import { api } from '../../api/axios'; // Adjust import based on your axios setup

const MemberNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/my-notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        
        // Extract unique clubs for filtering
        const uniqueClubs = ['ALL', ...new Set(res.data.notifications.map(n => n.clubName || 'NextEdge Society'))];
        setClubs(uniqueClubs);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = filter === 'ALL' 
    ? notifications 
    : notifications.filter(n => (n.clubName || 'NextEdge Society') === filter);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <Bell className="w-8 h-8 text-indigo-500" />
              Your Inbox
            </h1>
            <p className="text-muted-foreground mt-2">Notifications and society-wide announcements</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none transition-all cursor-pointer hover:bg-muted"
              >
                {clubs.map(club => (
                  <option key={club} value={club} className="bg-card text-foreground">{club === 'ALL' ? 'All Clubs' : club}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            
            <button 
              onClick={fetchNotifications}
              className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-foreground"
              title="Refresh"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-card/30 rounded-2xl border border-border animate-pulse"></div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id} 
                className="group bg-card hover:bg-card/80 transition-all border border-border hover:border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 text-foreground">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <h2 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">
                        {notification.subject}
                      </h2>
                      <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full">
                        {new Date(notification.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 bg-indigo-400/5 px-3 py-1 rounded-md">
                      {notification.clubName || 'NextEdge Society'}
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                      {notification.message}
                    </p>

                    {(notification.eventName || notification.venue) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl border border-border text-sm">
                        {notification.eventName && (
                          <div className="flex items-center gap-3 text-foreground">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <span className="truncate">{notification.eventName}</span>
                          </div>
                        )}
                        {notification.venue && (
                          <div className="flex items-center gap-3 text-foreground">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            <span className="truncate">{notification.venue}</span>
                          </div>
                        )}
                        {(notification.date || notification.time) && (
                          <div className="flex items-center gap-3 text-foreground">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>{notification.date} {notification.time && `at ${notification.time}`}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card/30 rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
               <Mail className="w-10 h-10 text-muted-foreground" />
             </div>
             <h2 className="text-2xl font-bold mb-3 text-foreground">No Notifications</h2>
             <p className="text-muted-foreground max-w-sm mx-auto">
               Your inbox is empty. Notifications from clubs and administrators will appear here once they are sent.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberNotifications;
