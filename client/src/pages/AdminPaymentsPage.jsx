import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPayments(filter);
  }, [filter]);

  const fetchPayments = async (statusFilter) => {
    try {
      setLoading(true);
      const query = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/payments/admin${query}`);
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching admin payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/payments/${id}/${action}`);
      // Refresh after action
      fetchPayments(filter);
    } catch (error) {
      console.error(`Error ${action} payment:`, error);
      alert(`Failed to ${action} payment.`);
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
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Filters */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Approvals</h1>
            <p className="text-gray-500 mt-1">Review manual payment proofs and approve/reject them.</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-gray-500 bg-gray-50">No payments found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Proof</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 p-2">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{payment.memberId?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{payment.memberId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{payment.purpose}</div>
                        <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${payment.amount}</td>
                      <td className="px-6 py-4 text-center">
                        {payment.proofUrl ? (
                          <a 
                            href={payment.proofUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"
                          >
                            <ExternalLink size={16} /> View
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleAction(payment._id, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(payment._id, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
