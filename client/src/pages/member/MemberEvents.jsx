import React, { useState, useEffect } from "react";
import { Calendar, Search, Filter, MapPin, Clock, ArrowRight, CheckCircle, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";

const MemberEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, statusPromises] = await Promise.all([
          api.get("/events"),
          // This is a bit inefficient if many events, ideally a single bulk check endpoint exists
          // For now, let's just get the events and then we'll check status if needed or assume 
          // we can fetch a 'my-events' list.
        ]);

        if (eventsRes.data.success) {
          const fetchedEvents = eventsRes.data.events || [];
          setEvents(fetchedEvents);

          // Mocking registration check for demonstration if a proper bulk endpoint isn't ready
          // In a real app, you'd fetch /events/my-registrations
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/register`, { confirmWord: "EVENT" });
      if (res.data.success) {
          alert("Successfully registered!");
          setRegisteredIds(prev => new Set(prev).add(eventId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
     return <div className="space-y-6">
        <div className="h-20 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-gray-900 border border-gray-800 rounded-3xl animate-pulse"></div>)}
        </div>
     </div>
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Header section */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-800/50">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
             <Calendar className="w-10 h-10 text-indigo-500" />
             Discover Events
          </h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Join exciting activities and engage with the community.</p>
        </div>
        
        <div className="flex items-center space-x-3">
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95 duration-200">
             <PlusCircle className="w-5 h-5" />
             Propose Event
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#0f0f0f] p-5 rounded-3xl border border-gray-800 shadow-xl">
         <div className="flex items-center space-x-2 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800">
            {["upcoming", "registered", "past"].map((f) => (
               <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                    filter === f 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
               >
                  {f}
               </button>
            ))}
         </div>

         <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, club or date..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-2xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
            />
         </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {events.length > 0 ? (
          events.map((event) => (
            <div 
              key={event._id} 
              className="group bg-[#0f0f0f] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl hover:border-indigo-500/40 transition-all duration-700 flex flex-col h-full relative"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                 <img 
                   src={event.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
                   alt={event.title}
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/90 via-transparent to-transparent"></div>
                 <div className="absolute top-4 right-4 flex items-center bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{event.category || "General"}</span>
                 </div>
                 
                 {/* Registration Status Badge */}
                 {registeredIds.has(event._id) && (
                   <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/20 shadow-lg shadow-emerald-500/20 animate-in fade-in zoom-in duration-500">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">Joined</span>
                   </div>
                 )}
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                 <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors leading-snug truncate">
                    {event.title}
                 </h3>
                 
                 <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-400 font-medium">
                       <div className="bg-gray-800/50 p-2 rounded-lg"><MapPin className="w-4 h-4 text-indigo-400" /></div>
                       <span className="text-sm">{event.venue || "TBA"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 font-medium">
                       <div className="bg-gray-800/50 p-2 rounded-lg"><Clock className="w-4 h-4 text-indigo-400" /></div>
                       <span className="text-sm">{new Date(event.date || event.eventStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {event.time || "10:00 AM"}</span>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="mt-auto flex items-center gap-3">
                    <Link
                      to={`/events/${event._id}`} 
                      className="flex-1 py-4 bg-gray-900/50 border border-gray-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                    >
                      Details
                    </Link>
                    
                    {!registeredIds.has(event._id) ? (
                      <button 
                        onClick={() => handleRegister(event._id)}
                        className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group/btn"
                      >
                        Register Now
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button 
                        className="flex-[2] py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-default"
                        disabled
                      >
                        Registered
                        <CheckCircle className="w-4 h-4 font-bold" />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#0f0f0f] rounded-[3rem] border border-dashed border-gray-800 text-center">
             <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-800 shadow-inner">
                <Calendar className="w-10 h-10 text-gray-600" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
             <p className="text-gray-500 max-w-sm font-medium">We couldn't find any events matching your current filters. Check back later for new updates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberEvents;
