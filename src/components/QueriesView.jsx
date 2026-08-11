import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  HelpCircle, Search, Filter, CheckCircle2, Clock, MessageSquare, 
  User, Send, X, CornerDownRight, AlertCircle, Check 
} from 'lucide-react';

export default function QueriesView({ currentUser, queries = [], onReplyQuery, onTriggerToast }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Response modal state
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseText, setResponseText] = useState('');

  const totalQueries = queries.length;
  const pendingQueries = queries.filter(q => q.status === 'Pending').length;
  const resolvedQueries = queries.filter(q => q.status === 'Resolved').length;

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          q.employeeEmail.toLowerCase().includes(search.toLowerCase()) ||
                          q.subject.toLowerCase().includes(search.toLowerCase()) ||
                          q.message.toLowerCase().includes(search.toLowerCase()) ||
                          q.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => (a.status === 'Pending' ? -1 : 1));

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      onTriggerToast('Please enter your response message', 'error');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const updatedQuery = {
      ...selectedQuery,
      status: 'Resolved',
      reply: {
        text: responseText.trim(),
        author: currentUser.name || 'HR Administrator',
        timestamp: formattedDate
      }
    };

    onReplyQuery(updatedQuery);
    onTriggerToast(`Replied to ${selectedQuery.employeeName}'s query and marked as Resolved ✓`, 'success');

    setSelectedQuery(null);
    setResponseText('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#6D5EF8]" /> Employee Queries & Support Portal
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Review employee questions, issue official HR replies, and manage inquiry resolution status
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="soft-card space-y-2 border-l-4 border-l-[#6D5EF8]">
          <div className="flex items-center justify-between">
            <span className="small-text font-bold text-[#6D5EF8]">Total Inquiries</span>
            <MessageSquare className="w-5 h-5 text-[#6D5EF8]" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{totalQueries}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Submitted across company</p>
        </div>

        <div className="soft-card space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="small-text font-bold text-amber-700">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-3xl font-extrabold text-amber-600">{pendingQueries}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Awaiting HR/Admin response</p>
        </div>

        <div className="soft-card space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="small-text font-bold text-emerald-700">Resolved Queries</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">{resolvedQueries}</span>
          <p className="text-[11px] text-slate-500 font-semibold">Completed & answered</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name, ID, subject..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All ({totalQueries})</option>
            <option value="Pending">Pending ({pendingQueries})</option>
            <option value="Resolved">Resolved ({resolvedQueries})</option>
          </select>
        </div>
      </div>

      {/* Queries Table / Directory */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
        <table className="w-full text-left text-xs text-slate-600 table-fixed">
          <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-3.5" style={{ width: '22%' }}>Employee Details</th>
              <th className="p-3.5" style={{ width: '32%' }}>Subject & Query Message</th>
              <th className="p-3.5" style={{ width: '16%' }}>Date & Time</th>
              <th className="p-3.5" style={{ width: '15%' }}>Status</th>
              <th className="p-3.5 text-right" style={{ width: '15%' }}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white/60">
            {filteredQueries.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No matching employee queries found</p>
                </td>
              </tr>
            ) : (
              filteredQueries.map((q) => (
                <tr key={q.id} className="hover:bg-purple-50/40 transition-colors">
                  
                  {/* EMPLOYEE INFO */}
                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900 text-xs">{q.employeeName}</p>
                      <p className="text-[10px] text-[#6D5EF8] font-mono font-semibold">{q.employeeEmail}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{q.department || 'Employee'}</p>
                    </div>
                  </td>

                  {/* SUBJECT & MESSAGE */}
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-extrabold text-[#6D5EF8]">{q.queryCode || `#QRY-${(q.id || '100').slice(0, 6).toUpperCase()}`}</span>
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={q.subject}>
                          {q.subject}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                        "{q.message}"
                      </p>

                      {/* Display reply if already resolved */}
                      {q.reply && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 font-semibold space-y-0.5 mt-1">
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-emerald-600" /> HR Response by {q.reply.author}:
                          </span>
                          <p className="pl-4 text-xs font-medium text-emerald-900">"{q.reply.text}"</p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* DATE & TIME */}
                  <td className="p-3.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    {q.timestamp}
                  </td>

                  {/* STATUS */}
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                      q.status === 'Resolved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {q.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      {q.status}
                    </span>
                  </td>

                  {/* ACTION BUTTON */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedQuery(q);
                        setResponseText(q.reply ? q.reply.text : '');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 ml-auto ${
                        q.status === 'Resolved'
                          ? 'bg-purple-50 text-[#6D5EF8] hover:bg-purple-100 border border-purple-200'
                          : 'btn-purple-gradient text-white shadow-purple-btn'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {q.status === 'Resolved' ? 'View / Edit Reply' : 'Respond & Resolve'}
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* HR RESPONSE & RESOLUTION MODAL */}
      {selectedQuery && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Respond to Employee Query</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{selectedQuery.queryCode || `#QRY-${(selectedQuery.id || '100').slice(0, 6).toUpperCase()}`} - {selectedQuery.employeeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedQuery(null)} 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs font-medium">
              
              {/* Original Query Card */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">{selectedQuery.subject}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{selectedQuery.timestamp}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap bg-white p-3 rounded-xl border border-purple-100">
                  "{selectedQuery.message}"
                </p>
                <p className="text-[10px] text-purple-700 font-semibold">
                  From: {selectedQuery.employeeName} ({selectedQuery.employeeEmail})
                </p>
              </div>

              {/* Response Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Official HR / Admin Response *</label>
                <textarea
                  rows="4"
                  required
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter detailed reply or instructions for the employee..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-extrabold transition-all active:scale-95 text-white flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Send Response & Resolve
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
