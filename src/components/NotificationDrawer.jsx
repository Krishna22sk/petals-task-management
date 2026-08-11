import React from 'react';
import { Bell, Check, Trash2, X, MessageSquare, AlertCircle, FolderKanban } from 'lucide-react';

export default function NotificationDrawer({ 
  notifications, 
  onClose, 
  onMarkAllRead 
}) {
  return (
    <div className="absolute right-4 top-16 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-3 ${
                n.unread ? 'bg-blue-50/20 dark:bg-blue-950/20 font-medium' : 'opacity-80'
              }`}
            >
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h5 className="font-bold text-slate-900 dark:text-slate-100">{n.title}</h5>
                <p className="text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{n.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
