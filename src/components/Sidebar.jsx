import React from 'react';
import { 
  LayoutDashboard, CheckSquare, PlusCircle, FolderKanban, ListFilter, 
  Calendar, Users, BarChart3, History, Settings, ChevronLeft, ChevronRight, 
  Shield, LogOut, HelpCircle
} from 'lucide-react';

export default function Sidebar({ 
  currentUser,
  activeView, 
  onSelectView, 
  collapsed, 
  onToggleCollapse,
  taskCounts = {}
}) {
  const role = currentUser.role || 'Employee';

  let navItems = [];

  if (role === 'Employee') {
    navItems = [
      { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { id: 'list-view', label: 'My Tasks (List View)', icon: CheckSquare, badge: taskCounts.total },
      { id: 'calendar', label: 'Task Calendar', icon: Calendar },
      { id: 'projects', label: 'Projects Directory', icon: FolderKanban },
    ];
  } else if (role === 'Team Leader') {
    navItems = [
      { id: 'dashboard', label: 'TL Dashboard', icon: LayoutDashboard },
      { id: 'assign-task', label: 'Assign Task Page', icon: PlusCircle },
      { id: 'projects', label: 'Project Management', icon: FolderKanban },
      { id: 'list-view', label: 'Team Tasks (List View)', icon: ListFilter, badge: taskCounts.total },
      { id: 'employees', label: 'Team Directory', icon: Users },
      { id: 'calendar', label: 'Task Calendar', icon: Calendar },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    ];
  } else {
    // Admin / HR
    navItems = [
      { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { id: 'employees', label: 'Employee Management', icon: Users },
      { id: 'queries', label: 'Employee Queries', icon: HelpCircle, badge: taskCounts.pendingQueries },
      { id: 'projects', label: 'Project Management', icon: FolderKanban },
      { id: 'list-view', label: 'Task Monitoring', icon: ListFilter, badge: taskCounts.total },
      { id: 'calendar', label: 'Task Calendar', icon: Calendar },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      { id: 'activity-log', label: 'Activity Audit Logs', icon: History },
      { id: 'settings', label: 'Organization Settings', icon: Settings },
    ];
  }

  return (
    <aside
      className={`relative h-[calc(100vh-32px)] m-4 bg-white border border-slate-200/80 rounded-2xl shadow-soft-purple transition-all duration-200 flex flex-col z-40 ${
        collapsed ? 'w-20' : 'w-[280px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 h-[72px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D5EF8] to-[#8B7BFF] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/30 flex-shrink-0">
            🌸
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                PETALS
              </span>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#6D5EF8]">
                {role} Portal
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-all text-xs relative ${
                isActive
                  ? 'sidebar-active'
                  : 'text-slate-600 hover:bg-[#F4F2FF] hover:text-[#6D5EF8] font-semibold rounded-xl'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-purple-100 text-[#6D5EF8]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Shield className="w-3.5 h-3.5 text-[#6D5EF8]" /> User Session:
          </div>
          <p className="text-[11px] text-purple-700 font-semibold truncate">
            {currentUser.name} ({role})
          </p>
        </div>
      )}
    </aside>
  );
}
