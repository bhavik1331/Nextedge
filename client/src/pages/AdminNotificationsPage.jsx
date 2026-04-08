import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Send, Users, AlertCircle, CheckCircle2 } from 'lucide-react'; // Assuming lucide-react is installed

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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
              <p className="text-sm text-gray-500">Send event announcements and updates</p>
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-4 mb-6 rounded-md flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p>{status.message}</p>
            </div>
          )}

          {/* Type Selector */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setNotificationType('single')}
              className={`flex-1 py-3 px-4 border rounded-md flex items-center justify-center gap-2 transition-all ${
                notificationType === 'single' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Send className="h-4 w-4" /> Single User
            </button>
            <button
              type="button"
              onClick={() => setNotificationType('bulk')}
              className={`flex-1 py-3 px-4 border rounded-md flex items-center justify-center gap-2 transition-all ${
                notificationType === 'bulk' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" /> All Members
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field - Only for single notifications */}
            {notificationType === 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required={notificationType === 'single'}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="NextEdge Society Update"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4 items-center flex gap-2">
                Event Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your email content here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p className="mt-2 text-xs text-gray-500">
                You can write plain text. HTML formatting is handled by the server template.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Sending...' : notificationType === 'single' ? 'Send Notification' : 'Send to All Members'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
