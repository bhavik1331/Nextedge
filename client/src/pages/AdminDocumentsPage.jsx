import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { FileText, Download, Clock, CheckCircle } from 'lucide-react';

const AdminDocumentsPage = () => {
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // tracks which button is loading

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both members and payments
      const [membersRes, paymentsRes] = await Promise.all([
        api.get('/members'),
        api.get('/payments/admin?status=Approved') // Only approved payments get receipts
      ]);
      setMembers(membersRes.data.members || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error('Error fetching data for documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type, id) => {
    try {
      setDownloading(`${type}-${id}`);
      
      // Blob response type is critical for downloading files via Axios
      const response = await api.get(`/documents/${type}/${id}`, {
        responseType: 'blob' 
      });

      // Extract filename from headers if possible, or use fallback
      let filename = `NextEdge_${type}.pdf`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      // Create a blob link to trigger a save prompt
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Document Generation Center
          </h1>
          <p className="text-gray-500 mt-1">Generate official PDF certificates, appointment letters, and payment receipts.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading databases...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Members Panel */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-800">Member Certificates & Appointments</h2>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {members.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No members found.</p>
                ) : (
                  members.map(member => (
                    <div key={member._id} className="p-4 border rounded hover:border-blue-300 transition flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{member.name || member.email}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <div className="flex gap-2 w-full xl:w-auto">
                        <button 
                          onClick={() => handleDownload('certificate', member._id)}
                          disabled={downloading === `certificate-${member._id}`}
                          className="flex-1 xl:flex-none inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded hover:bg-blue-100 transition whitespace-nowrap"
                        >
                          {downloading === `certificate-${member._id}` ? <Clock size={14} className="animate-spin"/> : <Download size={14} />}
                          Certificate
                        </button>
                        <button 
                          onClick={() => handleDownload('appointment', member._id)}
                          disabled={downloading === `appointment-${member._id}`}
                          className="flex-1 xl:flex-none inline-flex justify-center items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-100 transition whitespace-nowrap"
                        >
                          {downloading === `appointment-${member._id}` ? <Clock size={14} className="animate-spin"/> : <Download size={14} />}
                          Appt Letter
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payments Panel */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold text-gray-800">Approved Payment Receipts</h2>
                <p className="text-xs text-gray-500">Only Approved payments are eligible for official receipts.</p>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No approved payments found.</p>
                ) : (
                  payments.map(payment => (
                    <div key={payment._id} className="p-4 border rounded hover:border-green-300 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.memberId?.name || payment.memberId?.email || 'Unknown Member'}</p>
                        <p className="text-xs text-gray-500">{payment.purpose} - ${payment.amount}</p>
                        <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle size={12}/> Approved
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDownload('receipt', payment._id)}
                        disabled={downloading === `receipt-${payment._id}`}
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded hover:bg-green-100 transition whitespace-nowrap border border-green-200"
                      >
                        {downloading === `receipt-${payment._id}` ? <Clock size={16} className="animate-spin"/> : <Download size={16} />}
                        Download Receipt
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
