import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { Upload, CheckCircle, Clock, XCircle, CreditCard, ArrowUpRight, ShieldCheck, DollarSign, FileText } from 'lucide-react';

const MemberPayments = () => {
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
      if (response.data.success) {
        setPayments(response.data.payments);
      }
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
      
      setSubmitStatus({ type: 'success', message: 'Payment submitted successfully for review!' });
      setFormData({ amount: '', purpose: 'Membership Fee', notes: '' });
      setProofImage(null);
      
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
    const styles = {
      Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest flex items-center gap-2 w-fit ${styles[status] || styles.Pending}`}>
        {status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : status === 'Rejected' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  if (loading) {
     return <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-gray-900 border border-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="h-[600px] bg-gray-900 border border-gray-800 rounded-3xl"></div>
           <div className="lg:col-span-2 h-[600px] bg-gray-900 border border-gray-800 rounded-3xl"></div>
        </div>
     </div>
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-800/50">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
             <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <CreditCard className="w-8 h-8 text-indigo-500" />
             </div>
             Financial Portal
          </h1>
          <p className="text-gray-400 text-lg mt-2 font-medium">Manage dues, track transactions, and download receipts.</p>
        </div>
        
        <div className="flex items-center space-x-3">
           <div className="bg-[#0f0f0f] border border-gray-800 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                 <DollarSign className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Running Balance</p>
                 <p className="text-2xl font-black text-white">$0.00</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Payment Submission Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
            {/* Form decorative glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3 relative z-10">
               <ArrowUpRight className="w-6 h-6 text-indigo-400" />
               Submit Payment
            </h2>
            <p className="text-gray-400 text-sm mb-8 font-medium relative z-10">Verify your manual transaction by uploading proof.</p>
            
            {submitStatus.message && (
              <div className={`p-4 mb-6 rounded-2xl text-sm font-bold border animate-in slide-in-from-top duration-500 ${
                submitStatus.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Payment Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-gray-200 font-bold focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                >
                  <option value="Membership Fee">Membership Fee</option>
                  <option value="Event Registration">Event Registration</option>
                  <option value="Workshop">Workshop / Course</option>
                  <option value="Donation">Other / Donation</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Amount ($)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold">
                      <DollarSign className="w-5 h-5" />
                   </div>
                   <input
                     type="number"
                     name="amount"
                     required
                     min="1"
                     value={formData.amount}
                     onChange={handleChange}
                     className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 pl-10 text-gray-200 font-bold focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                     placeholder="0.00"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Transaction Proof</label>
                <div className="relative group/upload">
                   <input 
                     type="file" 
                     id="proof-upload"
                     accept="image/*" 
                     onChange={handleFileChange}
                     className="hidden" 
                   />
                   <label htmlFor="proof-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-800 bg-gray-900/30 rounded-[2rem] p-8 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800/40 transition-all duration-300">
                     <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-gray-500 group-hover/upload:scale-110 group-hover/upload:bg-indigo-600/10 group-hover/upload:text-indigo-400 transition-all duration-300">
                        <Upload className="h-7 w-7" />
                     </div>
                     <span className="text-sm text-gray-300 font-bold mb-1">Select Receipt Image</span>
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PNG, JPG up to 5MB</span>
                     
                     {proofImage && (
                       <div className="mt-4 flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 scale-105 animate-in zoom-in duration-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400 truncate max-w-[150px]">{proofImage.name}</span>
                       </div>
                     )}
                   </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className={`w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] duration-200 ${submitting ? 'opacity-70 animate-pulse' : ''}`}
              >
                {submitting ? 'Processing...' : 'Confirm Submission'}
              </button>
            </form>
            
            <div className="mt-10 pt-6 border-t border-gray-800/50 flex items-center justify-center gap-3 opacity-60">
               <ShieldCheck className="w-5 h-5 text-gray-500" />
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">Secure Payment Verification Module v2.4</p>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        <div className="lg:col-span-2">
           <div className="bg-[#0f0f0f] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-gray-800/50 flex items-center justify-between bg-[#0a0a0a]/30">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-4">
                    <FileText className="w-7 h-7 text-indigo-500" />
                    Transaction Logs
                 </h2>
                 <div className="text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl">
                    Digital Receipts
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-[500px]">
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-32 opacity-50 px-10 text-center">
                    <div className="w-24 h-24 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-center mb-8">
                       <DollarSign className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Transactions Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm">When you submit payments for fees or events, they will appear here as verified records.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#0f0f0f] z-10 border-b border-gray-800/50">
                      <tr>
                        <th className="py-6 px-8 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Transaction / Date</th>
                        <th className="py-6 px-8 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Intent</th>
                        <th className="py-6 px-8 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Amount</th>
                        <th className="py-6 px-8 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                        <th className="py-6 px-8 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/30">
                      {payments.map(payment => (
                        <tr key={payment._id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                          <td className="py-7 px-8">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-white mb-0.5">{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="text-[10px] text-gray-500 font-mono font-bold tracking-tighter uppercase">{payment._id.substring(18)}</span>
                             </div>
                          </td>
                          <td className="py-7 px-8">
                             <span className="text-xs font-black text-gray-100 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">{payment.purpose}</span>
                          </td>
                          <td className="py-7 px-8">
                             <span className="text-lg font-black text-white">${payment.amount.toLocaleString()}</span>
                          </td>
                          <td className="py-7 px-8">
                             {getStatusBadge(payment.status)}
                          </td>
                          <td className="py-7 px-8 text-right">
                             <button className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:border-indigo-500/30 transition-all font-bold">
                                <FileText className="w-5 h-5" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Table Footer */}
              <div className="p-8 bg-[#0a0a0a]/30 border-t border-gray-800 flex items-center justify-between">
                 <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Last Updated: {new Date().toLocaleTimeString()}</p>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Synchronized</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPayments;
