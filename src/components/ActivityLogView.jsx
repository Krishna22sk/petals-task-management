import React, { useState } from 'react';
import { History, Search, Filter, ShieldAlert, User, Clock, FileDiff } from 'lucide-react';

export default function ActivityLogView({ activities }) {
  const [search, setSearch] = useState('');

  const filtered = activities.filter(a => 
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.target.toLowerCase().includes(search.toLowerCase()) ||
    a.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" /> System Audit Trail & Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time record of all task creations, status mutations, comments, and logins
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 rounded-2xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, or task ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Action Executed</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <img src={log.avatar} alt={log.user} className="w-6 h-6 rounded-full object-cover" />
                    {log.user}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {log.target}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">
                    {log.timestamp}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    192.168.1.104
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
