import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-semibold">
      {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}

      <span>{toast.message}</span>

      <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
