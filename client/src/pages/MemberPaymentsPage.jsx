import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

const MemberPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: 'Membership Fee',
    notes: '',
  });
  const [proofImage, setProofImage] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/member');
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setProofImage(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofImage) {
      setSubmitStatus({ type: 'error', message: 'Please upload a proof of payment image' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    const payload = new FormData();
    payload.append('amount', formData.amount);
    payload.append('purpose', formData.purpose);
    payload.append('notes', formData.notes);
    payload.append('proofImage', proofImage);

    try {
      await api.post(`/payments/manual`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSubmitStatus({ type: 'success', message: 'Payment submitted successfully for review' });
      setFormData({ amount: '', purpose: 'Membership Fee', notes: '' });
      setProofImage(null);
      // Reset file input element visually
      document.getElementById('proof-upload').value = '';
      
      fetchPayments(); // Refresh list
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit payment' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><CheckCircle size={14}/> Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"><XCircle size={14}/> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"><Clock size={14}/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Payments & Dues</h1>
          <p className="text-gray-500 mt-1">Manage your membership fees and track payment status.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Submit Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Submit Manual Payment</h2>
              
              {submitStatus.message && (
                <div className={`p-3 mb-4 rounded text-sm ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 border' : 'bg-red-50 text-red-700 border-red-200 border'}`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Event Registration">Event Registration</option>
                    <option value="Other">Other / Donation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Payment Proof</label>
                  <div className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                    <input 
                      type="file" 
                      id="proof-upload"
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-blue-600 font-medium">Click to upload image</span>
                      {proofImage && <span className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{proofImage.name}</span>}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition flex justify-center ${submitting ? 'opacity-70' : ''}`}
                >
                  {submitting ? 'Submitting...' : 'Submit Payment Route'}
                </button>
              </form>
              
              <div className="mt-6 border-t pt-4">
                 <p className="text-xs text-gray-500 text-center">Online Payment Gateway (Stripe) integration coming soon.</p>
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-2">
             <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
               <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Your Payment History</h2>

               {loading ? (
                 <p className="text-gray-500 text-center py-8">Loading history...</p>
               ) : payments.length === 0 ? (
                 <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                   <p className="text-gray-500">No previous payments found.</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-700 border-b">
                       <tr>
                         <th className="px-4 py-3">Date</th>
                         <th className="px-4 py-3">Purpose</th>
                         <th className="px-4 py-3">Amount</th>
                         <th className="px-4 py-3">Method</th>
                         <th className="px-4 py-3">Status</th>
                       </tr>
                     </thead>
                     <tbody>
                       {payments.map(payment => (
                         <tr key={payment._id} className="border-b hover:bg-gray-50">
                           <td className="px-4 py-3 text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                           <td className="px-4 py-3 font-medium text-gray-900">{payment.purpose}</td>
                           <td className="px-4 py-3 font-bold">${payment.amount}</td>
                           <td className="px-4 py-3 text-gray-500 capitalize">{payment.paymentType}</td>
                           <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPaymentsPage;
