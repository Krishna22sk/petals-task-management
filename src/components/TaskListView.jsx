import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Filter, CheckCircle2, Clock, Trash2, ArrowUpDown, Edit3,
  Download, Eye, Plus, FileSpreadsheet, FileText, CheckSquare, PlusCircle, X, AlertTriangle, Play, Pause, RotateCcw, Square
} from 'lucide-react';

// LocalStorage helpers for persistent timers across F5 refresh
const getActiveTimersFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('petals_active_timers');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const saveActiveTimerToLocalStorage = (taskId, timerInfo) => {
  try {
    const current = getActiveTimersFromLocalStorage();
    if (timerInfo) {
      current[taskId] = timerInfo;
    } else {
      delete current[taskId];
    }
    localStorage.setItem('petals_active_timers', JSON.stringify(current));
  } catch (e) {}
};

export default function TaskListView({ 
  currentUser,
  tasks, 
  onOpenTaskModal, 
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onSwitchView,
  onTriggerToast 
}) {
  const userRoleStr = (typeof currentUser?.role === 'string' ? currentUser.role : currentUser?.role?.role_name || 'Employee').toString().trim().toLowerCase();
  const isEmployee = userRoleStr === 'employee' || userRoleStr === 'intern';
  const isTeamLeader = userRoleStr.includes('team leader') || userRoleStr === 'tl';
  const isAdminOrHR = userRoleStr === 'admin' || userRoleStr === 'hr' || userRoleStr === 'manager';
  const role = currentUser?.role || 'Employee';

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterEmployee, setFilterEmployee] = useState('All');
  const [search, setSearch] = useState('');

  // Collect unique employee names for HR & TL filter dropdown
  const uniqueEmployeeNames = Array.from(new Set(
    tasks.map(t => t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name)).filter(Boolean)
  )).sort();

  // STATUS CHANGE POPUP MODAL STATE
  const [statusPromptModal, setStatusPromptModal] = useState(null);
  const [promptText, setPromptText] = useState('');

  // EDIT TASK MODAL STATE (HR & TL)
  const [editTaskModal, setEditTaskModal] = useState(null);

  // Force re-render every second for running timers
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  const activeTimersMap = getActiveTimersFromLocalStorage();
  const hasRunningTimers = tasks.some(t => t.timerRunning === true || Boolean(activeTimersMap[t.id]?.timerRunning));

  useEffect(() => {
    if (hasRunningTimers) {
      intervalRef.current = setInterval(() => {
        setTick(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasRunningTimers]);

  // Calculate live elapsed seconds for a task with F5 persistence support
  const getElapsedSeconds = useCallback((task) => {
    const currentTimers = getActiveTimersFromLocalStorage();
    const storedInfo = currentTimers[task.id];

    const isRunning = task.timerRunning || (storedInfo ? storedInfo.timerRunning : false);
    const startedAt = task.timerStartedAt || (storedInfo ? storedInfo.timerStartedAt : null);
    const base = task.elapsedSeconds !== undefined 
      ? task.elapsedSeconds 
      : (storedInfo?.elapsedSeconds !== undefined 
        ? storedInfo.elapsedSeconds 
        : (task.actualTime ? Math.round(task.actualTime * 3600) : 0));

    if (isRunning && startedAt) {
      const now = Date.now();
      const extra = Math.floor((now - startedAt) / 1000);
      return Math.max(0, base + extra);
    }
    return Math.max(0, base);
  }, [tick]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // START timer — persists start time to localStorage & DB
  const startTimer = (taskId) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;
    
    const now = Date.now();
    const baseSeconds = taskObj.elapsedSeconds || (taskObj.actualTime ? Math.round(taskObj.actualTime * 3600) : 0);

    saveActiveTimerToLocalStorage(taskId, {
      timerRunning: true,
      timerStartedAt: now,
      elapsedSeconds: baseSeconds,
    });

    const updatedTask = {
      ...taskObj,
      status: 'In Progress',
      timerRunning: true,
      timerStartedAt: now,
      elapsedSeconds: baseSeconds,
    };
    onUpdateTask(updatedTask);
    onTriggerToast(`Timer started for ${taskId} ▶`, 'success');
  };

  // PAUSE (Hold) timer — freezes accumulated time & clears active timer storage
  const pauseTimer = (taskId) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const currentElapsed = getElapsedSeconds(taskObj);
    saveActiveTimerToLocalStorage(taskId, null);

    const updatedTask = {
      ...taskObj,
      timerRunning: false,
      timerStartedAt: null,
      elapsedSeconds: currentElapsed,
      actualTime: parseFloat((currentElapsed / 3600).toFixed(2)),
    };
    onUpdateTask(updatedTask);
  };

  // RESUME timer
  const resumeTimer = (taskId) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const now = Date.now();
    const currentElapsed = getElapsedSeconds(taskObj);

    saveActiveTimerToLocalStorage(taskId, {
      timerRunning: true,
      timerStartedAt: now,
      elapsedSeconds: currentElapsed,
    });

    const updatedTask = {
      ...taskObj,
      status: 'In Progress',
      timerRunning: true,
      timerStartedAt: now,
      elapsedSeconds: currentElapsed,
    };
    onUpdateTask(updatedTask);
    onTriggerToast(`Timer resumed for ${taskId} ▶`, 'success');
  };

  // Filter Tasks by Role (Employees see all tasks assigned to them)
  const roleBaseTasks = isEmployee 
    ? tasks.filter(t => {
        const empNameMatch = (t.assigneeName && currentUser?.name && t.assigneeName.toLowerCase().includes(currentUser.name.toLowerCase())) || 
                             (typeof t.assignee === 'string' && currentUser?.name && t.assignee.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                             (t.assignee?.name && currentUser?.name && t.assignee.name.toLowerCase().includes(currentUser.name.toLowerCase()));
        const empIdMatch = (t.assignedTo && t.assignedTo === currentUser?.id) || 
                           (t.assigneeId && t.assigneeId === currentUser?.id) || 
                           (t.assignee?.id && t.assignee.id === currentUser?.id);
        const empEmailMatch = (t.assigneeEmail && currentUser?.email && t.assigneeEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
                              (t.assignee?.email && currentUser?.email && t.assignee.email.toLowerCase() === currentUser.email.toLowerCase());
        return empNameMatch || empIdMatch || empEmailMatch;
      })
    : isTeamLeader
    ? tasks.filter(t => {
        const tlNameMatch = (t.assignedBy && currentUser?.name && t.assignedBy.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                            (t.teamLeaderName && currentUser?.name && t.teamLeaderName.toLowerCase().includes(currentUser.name.toLowerCase()));
        const tlIdMatch = (t.assignedById && t.assignedById === currentUser?.id);
        return tlNameMatch || tlIdMatch;
      })
    : tasks;

  const effectiveRoleTasks = (isTeamLeader && roleBaseTasks.length === 0) ? tasks : roleBaseTasks;

  // Status priority map
  const statusPriority = {
    'In Progress': 1,
    'Pending': 1,
    'Under Review': 1,
    'On Hold': 2,
    'Completed': 3
  };

  const filteredTasks = roleBaseTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.id.toLowerCase().includes(search.toLowerCase()) ||
                          (t.taskCode && t.taskCode.toLowerCase().includes(search.toLowerCase())) ||
                          t.project.toLowerCase().includes(search.toLowerCase()) ||
                          t.assignee?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          t.assigneeName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;

    const empName = t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name) || 'Unassigned';
    const matchesEmployee = filterEmployee === 'All' || empName.toLowerCase() === filterEmployee.toLowerCase();

    return matchesSearch && matchesStatus && matchesEmployee;
  }).sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

  // Intercept Status Dropdown Change
  const handleDropdownChange = (taskId, targetStatus) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    if (targetStatus === 'In Progress') {
      if (taskObj.timerRunning) return; // already running
      if (taskObj.elapsedSeconds > 0) {
        resumeTimer(taskId);
      } else {
        startTimer(taskId);
      }
      return;
    }

    if (targetStatus === 'On Hold') {
      pauseTimer(taskId);
      setStatusPromptModal({
        taskId: taskId,
        taskTitle: taskObj.title,
        targetStatus: 'On Hold',
        titleText: 'Reason for placing Task On Hold',
        placeholderText: 'Please enter why this task is being put on hold...'
      });
      setPromptText('');
    } else if (targetStatus === 'Completed') {
      pauseTimer(taskId);
      setStatusPromptModal({
        taskId: taskId,
        taskTitle: taskObj.title,
        targetStatus: 'Completed',
        titleText: 'Completion Summary & Deliverables',
        placeholderText: 'Please summarize what work was completed...',
        finalElapsed: getElapsedSeconds(taskObj)
      });
      setPromptText('');
    } else {
      pauseTimer(taskId);
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  // Submit Status Change Prompt
  const handleSaveStatusPrompt = () => {
    if (!promptText.trim()) {
      onTriggerToast(`Please enter a note for marking task as ${statusPromptModal.targetStatus}`, 'error');
      return;
    }

    const taskObj = tasks.find(t => t.id === statusPromptModal.taskId);
    if (taskObj) {
      const finalElapsed = statusPromptModal.finalElapsed || getElapsedSeconds(taskObj);
      const prefix = statusPromptModal.targetStatus === 'On Hold' ? '[ON HOLD REASON]' : '[COMPLETED SUMMARY]';
      const timeNote = `[Time Spent: ${formatTime(finalElapsed)}]`;
      const newRemark = {
        id: `rem-${Date.now()}`,
        author: currentUser.name,
        text: `${prefix}: ${promptText.trim()} ${timeNote}`,
        timestamp: new Date().toLocaleString()
      };

      const updatedTask = {
        ...taskObj,
        status: statusPromptModal.targetStatus,
        elapsedSeconds: finalElapsed,
        timerRunning: false,
        timerStartedAt: null,
        completedAt: statusPromptModal.targetStatus === 'Completed' ? new Date().toISOString() : taskObj.completedAt,
        totalTimeSpent: statusPromptModal.targetStatus === 'Completed' ? formatTime(finalElapsed) : taskObj.totalTimeSpent,
        remarks: [...(taskObj.remarks || []), newRemark]
      };

      onUpdateTask(updatedTask);
      onTriggerToast(`Task ${statusPromptModal.taskId} → "${statusPromptModal.targetStatus}" ✓ (${formatTime(finalElapsed)})`, 'success');
    }

    setStatusPromptModal(null);
    setPromptText('');
  };

  // EXCEL / CSV EXPORT FUNCTION
  const exportToExcel = () => {
    if (!filteredTasks || filteredTasks.length === 0) {
      onTriggerToast('No tasks available to export', 'error');
      return;
    }

    const headers = ["Task Code", "Task Name", "Project", "Employee", "TL Name", "Category", "Priority", "Status", "Start Date", "Due Date", "Runtime", "Actual Hours"];
    const rows = filteredTasks.map(t => {
      const elapsed = getElapsedSeconds(t);
      const runtime = formatTime(elapsed);
      const empName = t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name) || 'Unassigned';
      const tlName = t.assignedBy || t.teamLeaderName || 'Management';
      const taskCodeStr = t.taskCode || (t.id?.length > 15 ? `TSK-${t.id.slice(0,6).toUpperCase()}` : t.id);
      return [
        `"${taskCodeStr.replace(/"/g, '""')}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.project || '').replace(/"/g, '""')}"`,
        `"${empName.replace(/"/g, '""')}"`,
        `"${tlName.replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.status || ''}"`,
        `"${t.startDate || ''}"`,
        `"${t.dueDate || ''}"`,
        `"${runtime}"`,
        `"${(elapsed / 3600).toFixed(2)}"`
      ].join(",");
    });

    const reportName = role === 'Employee'
      ? `My_Tasks_Report_${(currentUser?.name || 'Employee').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
      : role === 'Team Leader'
      ? `Team_Tasks_Report_${(currentUser?.name || 'TL').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
      : `All_Employees_Task_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", reportName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast(`Excel (.CSV) report downloaded successfully (${filteredTasks.length} tasks)! 📊`, 'success');
  };

  // PDF / PRINT REPORT FUNCTION
  const exportToPDF = () => {
    if (!filteredTasks || filteredTasks.length === 0) {
      onTriggerToast('No tasks available to export', 'error');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {isEmployee ? 'My Tasks' : 'Task Monitoring'}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click <strong className="text-blue-500">▶ Start</strong> to begin timer. Status changes to <strong className="text-amber-500">On Hold</strong> or <strong className="text-emerald-500">Completed</strong> will prompt for notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            title="Download Excel CSV Report"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.CSV)
          </button>
          
          <button
            onClick={exportToPDF}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            title="Print / Export PDF Report"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>

          {(isTeamLeader || isAdminOrHR) && (
            <button
              onClick={() => onSwitchView('assign-task')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Assign Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task, employee, ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* STATUS FILTER DROPDOWN */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 font-bold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* EMPLOYEE FILTER DROPDOWN (HR & TL Only) */}
        {!isEmployee && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-bold">Employee:</span>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Employees ({tasks.length})</option>
              {uniqueEmployeeNames.map((empName) => {
                const count = tasks.filter(t => (t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name)) === empName).length;
                return (
                  <option key={empName} value={empName}>
                    👤 {empName} ({count} tasks)
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* ── MAIN TABLE ── */}
      <div className="glass-panel rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 table-fixed">
          <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3" style={{ width: '13%' }}>Employee</th>
              <th className="p-3" style={{ width: '20%' }}>Task Name</th>
              <th className="p-3" style={{ width: '11%' }}>TL Name</th>
              <th className="p-3" style={{ width: '11%' }}>Status</th>
              <th className="p-3" style={{ width: '17%' }}>Start & End Date</th>
              <th className="p-3" style={{ width: '20%' }}>Runtime</th>
              <th className="p-3 text-center" style={{ width: '8%' }}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTasks.map((task) => {
              const elapsed = getElapsedSeconds(task);
              const isRunning = task.timerRunning === true || Boolean(activeTimersMap[task.id]?.timerRunning);

              return (
                <tr key={task.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  
                  {/* EMPLOYEE NAME */}
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 truncate" title={task.assigneeName || task.assignee?.name || (typeof task.assignee === 'string' ? task.assignee : '') || 'Unassigned'}>
                    {task.assigneeName || task.assignee?.name || (typeof task.assignee === 'string' ? task.assignee : '') || 'Unassigned'}
                  </td>

                  {/* TASK NAME */}
                  <td 
                    onClick={() => onOpenTaskModal(task)} 
                    className="p-3 font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 truncate" 
                    title={task.title}
                  >
                    <span className="text-blue-500 font-mono text-[10px] mr-1">{task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}</span>
                    {task.title}
                  </td>

                  {/* TL NAME */}
                  <td className="p-3 text-slate-600 dark:text-slate-400 truncate" title={task.assignedBy || task.teamLeaderName || 'Management'}>
                    {task.assignedBy || task.teamLeaderName || 'Management'}
                  </td>

                  {/* STATUS DROPDOWN */}
                  <td className="p-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleDropdownChange(task.id, e.target.value)}
                      disabled={task.status === 'Completed'}
                      className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-extrabold border focus:outline-none cursor-pointer ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' :
                        task.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>

                  {/* START & END DATE */}
                  <td className="p-3 text-[11px] font-semibold">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold font-mono">
                        🚀 {task.startDate || '—'}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">
                        🏁 {task.dueDate || '—'}
                      </span>
                    </div>
                  </td>

                  {/* RUNTIME — LIVE WORKING TIMER */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {/* Timer Display */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-mono font-extrabold border ${
                        task.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : isRunning 
                            ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' 
                            : task.status === 'On Hold'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isRunning && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                        {task.status === 'Completed' && '✅ '}
                        {task.status === 'On Hold' && !isRunning && '⏸️ '}
                        {formatTime(elapsed)}
                      </span>

                      {/* Action Buttons */}
                      {task.status === 'Completed' ? (
                        <span className="text-[10px] text-emerald-600 font-bold">Done</span>
                      ) : task.status === 'Pending' ? (
                        <button
                          onClick={() => startTimer(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      ) : isRunning ? (
                        <button
                          onClick={() => handleDropdownChange(task.id, 'On Hold')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" /> Hold
                        </button>
                      ) : task.status === 'On Hold' ? (
                        <button
                          onClick={() => resumeTimer(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => startTimer(task.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                    </div>
                  </td>

                  {/* DELETE ACTION BUTTON (Hidden for Employee role) */}
                  <td className="p-3 text-center">
                    {!isEmployee ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete task "${task.title}" (${task.id}) permanently from Database?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete task permanently from database"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-mono">—</span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* STATUS PROMPT MODAL */}
      {statusPromptModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  statusPromptModal.targetStatus === 'On Hold' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Status: {statusPromptModal.targetStatus}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {statusPromptModal.titleText}
                </h3>
              </div>
              <button 
                onClick={() => setStatusPromptModal(null)} 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <p className="text-slate-600 font-semibold">
                Task: <span className="font-mono text-[#6D5EF8] font-bold">{statusPromptModal.taskId} - {statusPromptModal.taskTitle}</span>
              </p>

              {/* Show time spent info */}
              {statusPromptModal.finalElapsed !== undefined && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <Clock className="w-4 h-4 text-[#6D5EF8]" />
                  <span className="font-bold text-slate-800">
                    Total Time Worked: <span className="font-mono text-sm text-[#6D5EF8] font-extrabold">{formatTime(statusPromptModal.finalElapsed)}</span>
                  </span>
                </div>
              )}

              <textarea
                rows="4"
                required
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={statusPromptModal.placeholderText}
                className="w-full p-4 rounded-2xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setStatusPromptModal(null)} 
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatusPrompt}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition-all active:scale-95 ${
                  statusPromptModal.targetStatus === 'On Hold' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                Save Note & Change Status
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT TASK MODAL (HR / TL) */}
      {editTaskModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Edit Task Details ({editTaskModal.id})
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Update engineering specifications & assignments</p>
                </div>
              </div>
              <button 
                onClick={() => setEditTaskModal(null)} 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateTask(editTaskModal);
                setEditTaskModal(null);
                onTriggerToast(`Task ${editTaskModal.id} updated successfully!`, 'success');
              }}
              className="space-y-4 text-xs font-medium"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTaskModal.title}
                  onChange={(e) => setEditTaskModal({ ...editTaskModal, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Assignee Name</label>
                  <input
                    type="text"
                    required
                    value={editTaskModal.assignee?.name || editTaskModal.assignee || ''}
                    onChange={(e) => setEditTaskModal({ 
                      ...editTaskModal, 
                      assignee: typeof editTaskModal.assignee === 'object' ? { ...editTaskModal.assignee, name: e.target.value } : e.target.value 
                    })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editTaskModal.project || ''}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, project: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={editTaskModal.category || 'Planned Work'}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
                  >
                    <option value="Planned Work">Planned Work</option>
                    <option value="Extra Work">Extra Work</option>
                    <option value="Bug Fix">Bug Fix</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={editTaskModal.priority || 'High'}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={editTaskModal.status}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows="3"
                  value={editTaskModal.description || ''}
                  onChange={(e) => setEditTaskModal({ ...editTaskModal, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTaskModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all active:scale-95 text-white"
                >
                  Save Changes
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
