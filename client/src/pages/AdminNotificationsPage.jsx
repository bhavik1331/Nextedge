import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Send, Users, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'; // Assuming lucide-react is installed
import { Link } from 'react-router-dom';

const AdminNotificationsPage = () => {
  const [notificationType, setNotificationType] = useState('single'); // 'single' or 'bulk'
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
    eventName: '',
    date: '',
    time: '',
    venue: '',
    clubName: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const endpoint = notificationType === 'single' ? '/api/notifications/send' : '/api/notifications/send-bulk';
      const payload = { ...formData };
      
      // We don't send individual email if it's bulk
      if (notificationType === 'bulk') {
        delete payload.email;
      }

      // Using the base URL setup from your project, or hardcoded for development
      const response = await axios.post(endpoint, payload, {
        withCredentials: true // Important if using protected routes
      });

      setStatus({ type: 'success', message: response.data.message || 'Notification sent successfully!' });
      
      // Reset form
      setFormData({
        email: '',
        subject: '',
        message: '',
        eventName: '',
        date: '',
        time: '',
        venue: '',
        clubName: '',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send notification. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-indigo-500 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-card shadow-xl rounded-2xl p-6 sm:p-10 border border-border">
          <div className="flex items-center gap-4 mb-10 border-b border-border pb-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Email Notifications</h1>
              <p className="text-sm text-muted-foreground">Send event announcements and updates</p>
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 border ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="font-bold text-sm tracking-wide">{status.message}</p>
            </div>
          )}

          {/* Type Selector */}
          <div className="flex gap-4 mb-10">
            <button
              type="button"
              onClick={() => setNotificationType('single')}
              className={`flex-1 py-4 px-6 border rounded-xl flex items-center justify-center gap-3 transition-all font-bold uppercase tracking-widest text-xs ${
                notificationType === 'single' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Send className="h-4 w-4" /> Single User
            </button>
            <button
              type="button"
              onClick={() => setNotificationType('bulk')}
              className={`flex-1 py-4 px-6 border rounded-xl flex items-center justify-center gap-3 transition-all font-bold uppercase tracking-widest text-xs ${
                notificationType === 'bulk' 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Users className="h-4 w-4" /> All Members
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field - Only for single notifications */}
            {notificationType === 'single' && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Recipient Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required={notificationType === 'single'}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-background text-foreground placeholder-gray-500 transition-all font-medium"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                Email Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="NextEdge Society Update"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-background text-foreground placeholder-gray-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                Sending As (Club/Society Name)
              </label>
              <input
                type="text"
                name="clubName"
                value={formData.clubName}
                onChange={handleChange}
                placeholder="NextEdge Society"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-background text-foreground placeholder-gray-500 transition-all font-medium"
              />
              <p className="mt-1 text-[10px] text-muted-foreground font-medium italic">This will help members filter notifications in their inbox.</p>
            </div>

            <div className="bg-muted/30 p-6 rounded-2xl border border-border border-dashed">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-500" />
                Event Details (Optional Metadata)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder-gray-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm border border-border rounded-xl bg-background text-foreground placeholder-gray-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm border border-border rounded-xl bg-background text-foreground transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm border border-border rounded-xl bg-background text-foreground transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                required
                rows="6"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your email content here..."
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-background text-foreground placeholder-gray-500 transition-all font-medium resize-none"
              ></textarea>
              <p className="mt-2 text-[10px] text-muted-foreground font-medium italic">
                Markdown formatting supported. Final layout is managed by the society mailer templates.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-all active:scale-[0.98] ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Transmitting Data...' : notificationType === 'single' ? 'Send Notification' : 'Broadcast to All Members'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
