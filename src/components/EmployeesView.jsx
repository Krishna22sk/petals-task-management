import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Search, Plus, Mail, Shield, Trash2, Edit, ToggleLeft, ToggleRight, X, Clock, Timer, CheckCircle2, PlayCircle } from 'lucide-react';
import { MOCK_DEPARTMENTS } from '../data/mockData';


export default function EmployeesView({ 
  currentUser,
  employees, 
  tasks,
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  onTriggerToast 
}) {
  const role = currentUser.role || 'Employee';
  const isAdmin = role === 'Admin';
  const isAdminOrTL = role === 'Admin' || role === 'Team Leader';

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Employee State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empRole, setEmpRole] = useState('Employee');
  const [department, setDepartment] = useState('Embedded Systems');
  const [designation, setDesignation] = useState('Firmware Engineer');

  // Custom Department State
  const [deptList, setDeptList] = useState(MOCK_DEPARTMENTS);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptText, setCustomDeptText] = useState('');

  const allTasks = tasks || [];

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get elapsed seconds for a task
  const getElapsedSeconds = (task) => {
    const base = task.elapsedSeconds || 0;
    if (task.timerRunning && task.timerStartedAt) {
      const now = Date.now();
      const extra = Math.floor((now - task.timerStartedAt) / 1000);
      return base + extra;
    }
    return base;
  };

  // Get time stats for an employee
  const getEmployeeTimeStats = (emp) => {
    const empTasks = allTasks.filter(t => 
      t.assigneeId === emp.id || 
      t.assignee?.email === emp.email || 
      t.assignee?.name === emp.name
    );
    
    let totalSeconds = 0;
    let activeTasks = 0;
    let completedTasks = 0;
    let runningNow = false;

    empTasks.forEach(t => {
      totalSeconds += getElapsedSeconds(t);
      if (t.status === 'In Progress') activeTasks++;
      if (t.status === 'Completed') completedTasks++;
      if (t.timerRunning) runningNow = true;
    });

    return { totalSeconds, activeTasks, completedTasks, runningNow, taskCount: empTasks.length };
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(search.toLowerCase()) ||
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onTriggerToast('Please fill in employee name and email', 'error');
      return;
    }

    const finalDept = (isCustomDept && customDeptText.trim()) ? customDeptText.trim() : department;
    if (isCustomDept && customDeptText.trim() && !deptList.includes(customDeptText.trim())) {
      setDeptList([...deptList, customDeptText.trim()]);
    }

    const newEmp = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password: password.trim() || 'emp123',
      role: empRole,
      department: finalDept,
      designation: designation.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'Active',
      tlName: 'Rajesh Kulkarni',
      assignedTasks: 0,
      completedTasks: 0,
      efficiencyScore: 100
    };

    onAddEmployee(newEmp);
    onTriggerToast(`Employee ${newEmp.name} added to ${finalDept}! Login credentials created.`, 'success');
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPassword('');
    setIsCustomDept(false);
    setCustomDeptText('');
  };

  const toggleEmployeeStatus = (emp) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateEmployee({ ...emp, status: nextStatus });
    onTriggerToast(`Employee ${emp.name} marked as ${nextStatus}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#202124] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#6D5EF8]" /> Employee Management Directory
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isAdmin 
              ? 'Admin control center to add team members, edit designations, or toggle active/inactive status.'
              : 'Engineering team directory, designations, and workload performance scores.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 btn-purple-gradient text-xs shadow-purple-btn transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Employee
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="soft-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search engineers by name or role..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FAFBFF] border border-slate-200 text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-800 font-bold focus:outline-none cursor-pointer focus:ring-2 focus:ring-[#6D5EF8]"
          >
            <option value="All">All Departments</option>
            {MOCK_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const timeStats = getEmployeeTimeStats(emp);

          return (
            <div
              key={emp.id}
              className={`soft-card soft-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all ${
                emp.status === 'Inactive' ? 'opacity-60 grayscale' : ''
              }`}
            >
              <div className="space-y-4">
                
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6D5EF8&color=fff&font-size=0.45`} 
                      alt={emp.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=6D5EF8&color=fff&font-size=0.45`;
                      }}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-200" 
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-[#202124]">{emp.name}</h3>
                      </div>
                      <p className="text-xs font-bold text-[#6D5EF8]">{emp.designation}</p>
                      <p className="text-[11px] text-slate-400 truncate">{emp.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {emp.status}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => toggleEmployeeStatus(emp)}
                          className="p-1 text-slate-400 hover:text-[#6D5EF8]"
                          title="Toggle Active/Inactive"
                        >
                          {emp.status === 'Active' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete employee ${emp.name}?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Box */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Assigned</span>
                    <p className="text-sm font-extrabold text-slate-800">{emp.assignedTasks}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Done</span>
                    <p className="text-sm font-extrabold text-emerald-600">{emp.completedTasks}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold">Efficiency</span>
                    <p className="text-sm font-extrabold text-[#6D5EF8]">{emp.efficiencyScore}%</p>
                  </div>
                </div>

                {/* TIME TRACKING SECTION — visible to Admin & TL */}
                {isAdminOrTL && allTasks.length > 0 && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/60 to-purple-50/60 border border-blue-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Timer className="w-3 h-3 text-[#6D5EF8]" /> Work Time Tracking
                      </span>
                      {timeStats.runningNow && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          WORKING NOW
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold">Total Time</span>
                        <p className={`text-sm font-extrabold font-mono ${timeStats.runningNow ? 'text-blue-700' : 'text-slate-800'}`}>
                          {formatTime(timeStats.totalSeconds)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5">
                          <PlayCircle className="w-3 h-3 text-blue-500" /> Active
                        </span>
                        <p className="text-sm font-extrabold text-blue-600">{timeStats.activeTasks}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Done
                        </span>
                        <p className="text-sm font-extrabold text-emerald-600">{timeStats.completedTasks}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <a href={`mailto:${emp.email}`} className="text-slate-500 hover:text-[#6D5EF8] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {emp.email}
                </a>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#6D5EF8]">
                  {emp.role}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Admin Add Employee Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add New Employee</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Create account credentials & assign role</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} autoComplete="off" className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kavitha Sundaram"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Email Address (Username)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    autoComplete="new-password"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kavitha@petals.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Login Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="pass123"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Role</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Admin">Admin / HR</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={isCustomDept ? 'CUSTOM_NEW' : department}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_NEW') {
                        setIsCustomDept(true);
                      } else {
                        setIsCustomDept(false);
                        setDepartment(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
                  >
                    {deptList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="CUSTOM_NEW">➕ Add Custom Department...</option>
                  </select>
                </div>
              </div>

              {isCustomDept && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#6D5EF8]">Custom Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Firmware & Embedded Systems"
                    value={customDeptText}
                    onChange={(e) => setCustomDeptText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-purple-50/60 border border-purple-200 text-[#6D5EF8] font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Designation / Title</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Firmware Developer (C/C++)"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 btn-purple-gradient text-xs shadow-purple-btn transition-all active:scale-[0.98]"
                >
                  Save Employee Account
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
