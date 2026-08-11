import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Bell, Palette, Shield, Save, Check } from 'lucide-react';
import { MOCK_COMPANY_SETTINGS } from '../data/mockData';

export default function SettingsView({ onTriggerToast }) {
  const [companyName, setCompanyName] = useState(MOCK_COMPANY_SETTINGS.name);
  const [website, setWebsite] = useState(MOCK_COMPANY_SETTINGS.website);
  const [emailAssign, setEmailAssign] = useState(MOCK_COMPANY_SETTINGS.notificationDefaults.emailOnAssign);
  const [emailOverdue, setEmailOverdue] = useState(MOCK_COMPANY_SETTINGS.notificationDefaults.emailOnOverdue);

  const handleSave = () => {
    onTriggerToast('Company settings & notification preferences updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Organization Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure Petals Automation company preferences, priority rules, and email alert switches
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Company Info Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" /> Company Profile Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Portal Website Domain</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </div>

      {/* Priority Colors Setup */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-500" /> Priority Color Indicators
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 space-y-1 border border-red-300 dark:border-red-900">
            <span className="font-bold text-red-600">Critical Priority</span>
            <p className="text-[10px] text-slate-400">Badge Color: Red (#EF4444)</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 space-y-1 border border-amber-300 dark:border-amber-900">
            <span className="font-bold text-amber-600">High Priority</span>
            <p className="text-[10px] text-slate-400">Badge Color: Amber (#F59E0B)</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 space-y-1 border border-blue-300 dark:border-blue-900">
            <span className="font-bold text-blue-600">Medium Priority</span>
            <p className="text-[10px] text-slate-400">Badge Color: Royal Blue (#2563EB)</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 space-y-1 border border-emerald-300 dark:border-emerald-900">
            <span className="font-bold text-emerald-600">Low Priority</span>
            <p className="text-[10px] text-slate-400">Badge Color: Emerald (#10B981)</p>
          </div>
        </div>
      </div>

      {/* Notifications Controls */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-500" /> Notification Channels & Toggles
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Email Notification on Task Assignment</p>
              <p className="text-slate-400">Send instant HTML email to assigned engineers when a task is dispatched</p>
            </div>
            <input
              type="checkbox"
              checked={emailAssign}
              onChange={(e) => setEmailAssign(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Overdue Task Alert Reminders</p>
              <p className="text-slate-400">Automated morning reminder emails for pending tasks past due date</p>
            </div>
            <input
              type="checkbox"
              checked={emailOverdue}
              onChange={(e) => setEmailOverdue(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
