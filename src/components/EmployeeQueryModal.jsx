import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Send, X, Search, CheckCircle2, Clock, MessageSquare, Filter } from 'lucide-react';

export default function EmployeeQueryModal({ currentUser, queries = [], onClose, onSubmitQuery, onTriggerToast }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // History tab search & filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter employee's own queries only
  const myQueries = queries.filter(q => 
    q.employeeId === currentUser.id || 
    q.employeeEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
    q.employeeName === currentUser.name
  );

  const filteredQueries = myQueries.filter(q => {
    const matchesSearch = q.subject.toLowerCase().includes(search.toLowerCase()) ||
                          q.message.toLowerCase().includes(search.toLowerCase()) ||
                          q.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      onTriggerToast('Please enter both subject and message', 'error');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newQuery = {
      id: `QRY-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      department: currentUser.department || 'Engineering',
      subject: subject.trim(),
      message: message.trim(),
      timestamp: formattedDate,
      status: 'Pending',
      reply: null
    };

    onSubmitQuery(newQuery);
    onTriggerToast(`Query ${newQuery.id} submitted to HR/Admin successfully!`, 'success');
    
    // Switch to history tab to view submitted query
    setSubject('');
    setMessage('');
    setActiveTab('history');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Employee Query Portal</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Submit questions, payroll or policy inquiries to HR/Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'bg-white text-[#6D5EF8] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Submit New Query
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'history'
                ? 'bg-white text-[#6D5EF8] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> My Queries ({myQueries.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT NEW QUERY */}
        {activeTab === 'new' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                👤 Submitting as: <span className="text-[#6D5EF8] font-extrabold">{currentUser.name} ({currentUser.email})</span>
              </p>
              <p className="text-slate-500">Your query will be delivered directly to the HR & Management team.</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Subject / Category *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Attendance Verification, Payroll Slip Request, Hardware Upgrade..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Query Details / Message *</label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry or request in detail..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all active:scale-95 text-white flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Query
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MY QUERIES HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject or query..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Queries List */}
            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
              {filteredQueries.length === 0 ? (
                <div className="text-center py-10 space-y-2 border-2 border-dashed border-purple-100 rounded-2xl bg-purple-50/30">
                  <HelpCircle className="w-8 h-8 text-purple-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No submitted queries found</p>
                  <p className="text-[11px] text-slate-400">Click "Submit New Query" above to send a request to HR/Admin.</p>
                </div>
              ) : (
                filteredQueries.map((q) => (
                  <div 
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-[#FAFBFF] space-y-3 shadow-sm hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-[#6D5EF8]">{q.id}</span>
                        <h4 className="text-xs font-bold text-slate-900">{q.subject}</h4>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        q.status === 'Resolved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {q.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {q.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100">
                      {q.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>Submitted: {q.timestamp}</span>
                    </div>

                    {/* HR Reply Box */}
                    {q.reply && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> HR/Admin Reply from {q.reply.author}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{q.reply.timestamp}</span>
                        </div>
                        <p className="text-xs text-emerald-900 font-semibold whitespace-pre-wrap pl-5 border-l-2 border-emerald-400">
                          {q.reply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
