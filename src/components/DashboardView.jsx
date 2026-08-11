import React from 'react';
import { 
  Users, FolderKanban, CheckSquare, CheckCircle2, PlayCircle, 
  Clock, Plus, ChevronRight, Sparkles, Timer, TrendingUp
} from 'lucide-react';

export default function DashboardView({ 
  currentUser, 
  tasks, 
  employees, 
  projects,
  activities,
  onOpenTaskModal, 
  onSwitchView 
}) {
  const role = currentUser.role || 'Employee';

  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const onHoldTasks = tasks.filter(t => t.status === 'On Hold').length;

  const employeeTasks = tasks.filter(t => {
    const empNameMatch = (t.assigneeName && currentUser.name && t.assigneeName.toLowerCase().includes(currentUser.name.toLowerCase())) || 
                         (typeof t.assignee === 'string' && currentUser.name && t.assignee.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                         (t.assignee?.name && currentUser.name && t.assignee.name.toLowerCase().includes(currentUser.name.toLowerCase()));
    const empIdMatch = (t.assignedTo && t.assignedTo === currentUser.id) || 
                       (t.assigneeId && t.assigneeId === currentUser.id) || 
                       (t.assignee?.id && t.assignee.id === currentUser.id);
    const empEmailMatch = (t.assigneeEmail && currentUser.email && t.assigneeEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
                          (t.assignee?.email && currentUser.email && t.assignee.email.toLowerCase() === currentUser.email.toLowerCase());
    return empNameMatch || empIdMatch || empEmailMatch;
  });

  const activeEmpTasks = employeeTasks.filter(t => t.status !== 'Completed');
  const todaysTasks = employeeTasks.filter(t => t.status === 'In Progress');
  const empCompletedTasks = employeeTasks.filter(t => t.status === 'Completed');

  const statusPriority = {
    'In Progress': 1,
    'Pending': 1,
    'Under Review': 1,
    'On Hold': 2,
    'Completed': 3
  };
  const sortedDisplayTasks = [...(role === 'Employee' ? employeeTasks : tasks)].sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99));

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get live elapsed seconds for a task (supports task.actualTime, task.elapsedSeconds & localStorage)
  const getElapsedSeconds = (task) => {
    let storedInfo = null;
    try {
      const timers = JSON.parse(localStorage.getItem('petals_active_timers') || '{}');
      storedInfo = timers[task.id];
    } catch (e) {}

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
  };

  // Build employee time tracking data for Admin/TL view
  const getEmployeeTimeData = () => {
    const empMap = {};
    tasks.forEach(task => {
      const empName = task.assignee?.name || task.assignee || 'Unassigned';
      const empId = task.assigneeId || task.assignee?.id || empName;
      if (!empMap[empId]) {
        empMap[empId] = {
          name: empName,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          totalTimeSpent: 0,
          tasks: []
        };
      }
      empMap[empId].totalTasks++;
      if (task.status === 'Completed') empMap[empId].completedTasks++;
      if (task.status === 'In Progress') empMap[empId].inProgressTasks++;
      empMap[empId].totalTimeSpent += getElapsedSeconds(task);
      empMap[empId].tasks.push(task);
    });
    return Object.values(empMap);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1440px] mx-auto">
      
      {/* Mutmiz Soft SaaS Lavender Gradient Banner */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#F3F1FF] via-[#ECE8FF] to-[#E5E0FF] p-8 border border-purple-100 shadow-soft-purple">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-purple-200 text-xs font-extrabold text-[#6D5EF8] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> {role} Dashboard Portal
            </span>
            <h1 className="heading-title text-[#202124] tracking-tight">
              Welcome back, {currentUser.name}! 🌸
            </h1>
            <p className="body-text text-slate-600 max-w-xl font-medium">
              {role === 'Admin' && `Overview of ${totalEmployees} active engineers across ${totalProjects} software automation projects.`}
              {role === 'Team Leader' && `Tracking ${inProgressTasks} active tasks currently assigned to your sprint team.`}
              {role === 'Employee' && `You have ${todaysTasks.length} active tasks in progress today and ${empCompletedTasks.length} completed deliverables.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'Team Leader' && (
              <button
                onClick={() => onSwitchView('assign-task')}
                className="px-5 py-3 btn-purple-gradient text-xs font-bold shadow-purple-btn transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Assign New Task
              </button>
            )}
            <button
              onClick={() => onSwitchView('list-view')}
              className="px-4 py-3 rounded-[14px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              Task Directory <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN KPI CARDS */}
      {role === 'Admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-[#6D5EF8] w-fit"><Users className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-[#202124]">{totalEmployees}</span>
            <p className="small-text text-slate-500 font-semibold">Total Employees</p>
          </div>

          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-[#6D5EF8] w-fit"><FolderKanban className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-[#202124]">{totalProjects}</span>
            <p className="small-text text-slate-500 font-semibold">Total Projects</p>
          </div>

          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-[#6D5EF8] w-fit"><CheckSquare className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-[#6D5EF8]">{totalTasks}</span>
            <p className="small-text text-slate-500 font-semibold">Total Tasks</p>
          </div>

          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit"><CheckCircle2 className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-emerald-600">{completedTasks}</span>
            <p className="small-text text-emerald-600 font-bold">Completed</p>
          </div>

          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit"><PlayCircle className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-blue-600">{inProgressTasks}</span>
            <p className="small-text text-blue-600 font-bold">In Progress</p>
          </div>

          <div className="soft-card soft-card-hover space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit"><Clock className="w-4.5 h-4.5" /></div>
            <span className="text-3xl font-extrabold text-amber-600">{pendingTasks}</span>
            <p className="small-text text-amber-600 font-bold">Pending</p>
          </div>
        </div>
      )}

      {/* TEAM LEADER KPI CARDS */}
      {role === 'Team Leader' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="soft-card soft-card-hover space-y-3">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-slate-700">Assigned Tasks</span>
              <CheckSquare className="w-5 h-5 text-[#6D5EF8]" />
            </div>
            <span className="text-4xl font-extrabold text-[#202124]">{totalTasks}</span>
            <p className="small-text text-slate-500 font-semibold">Total assigned to sprint team</p>
          </div>

          <div className="soft-card soft-card-hover space-y-3">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-emerald-700">Completed Tasks</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-4xl font-extrabold text-emerald-600">{completedTasks}</span>
            <p className="small-text text-slate-500 font-semibold">Verified deliverables</p>
          </div>

          <div className="soft-card soft-card-hover space-y-3">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-amber-700">Pending Tasks</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-4xl font-extrabold text-amber-600">{pendingTasks}</span>
            <p className="small-text text-slate-500 font-semibold">Awaiting execution start</p>
          </div>

          <div className="soft-card soft-card-hover space-y-3">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-slate-700">Employees Under TL</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-4xl font-extrabold text-[#202124]">{totalEmployees}</span>
            <p className="small-text text-slate-500 font-semibold">Active team engineers</p>
          </div>
        </div>
      )}

      {/* EMPLOYEE KPI CARDS */}
      {role === 'Employee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="soft-card soft-card-hover space-y-3 border-l-4 border-l-[#6D5EF8]">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-[#6D5EF8]">Assigned Work Items</span>
              <PlayCircle className="w-5 h-5 text-[#6D5EF8]" />
            </div>
            <span className="text-4xl font-extrabold text-[#202124]">{activeEmpTasks.length}</span>
            <p className="small-text text-slate-500 font-semibold">Active & assigned tasks for execution (Pending / In Progress / On Hold)</p>
          </div>

          <div className="soft-card soft-card-hover space-y-3 border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center">
              <span className="small-text font-bold text-emerald-600">Completed Tasks</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-4xl font-extrabold text-emerald-600">{empCompletedTasks.length}</span>
            <p className="small-text text-slate-500 font-semibold">Finished deliverables</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ADMIN & TL: EMPLOYEE TIME TRACKING TABLE — shows how long each employee worked */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {(role === 'Admin' || role === 'Team Leader') && (
        <div className="soft-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 text-[#6D5EF8]">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title text-[#202124]">Employee Work Time Tracker</h3>
                <p className="text-[10px] text-slate-500 font-medium">Real-time tracking — time starts only when employee clicks ▶ Start</p>
              </div>
            </div>
            <button 
              onClick={() => onSwitchView('list-view')}
              className="small-text font-bold text-[#6D5EF8] hover:underline flex items-center gap-1"
            >
              Full Task View <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-slate-50 to-purple-50/40 border-b border-slate-200">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Task</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Time Worked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDisplayTasks.map((task) => {
                  const elapsed = getElapsedSeconds(task);
                  const isRunning = task.timerRunning === true;

                  return (
                    <tr key={task.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {task.assignee?.avatar && (
                            <img src={task.assignee.avatar} alt="" className="w-7 h-7 rounded-lg object-cover ring-1 ring-purple-200" />
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{task.assignee?.name || task.assignee}</p>
                            <p className="text-[10px] text-slate-400">{task.assignee?.designation || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 truncate max-w-[200px]" title={task.title}>
                          <span className="text-[#6D5EF8] font-mono text-[10px] mr-1">{task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}</span>
                          {task.title}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          task.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-extrabold text-[12px] border ${
                          task.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : isRunning 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : elapsed > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {isRunning && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                          {task.status === 'Completed' && '✅ '}
                          {formatTime(elapsed)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Tasks Directory */}
      <div className="soft-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-[#202124]">
            {role === 'Employee' ? 'My Active Work Items' : 'Recent Engineering Tasks Directory'}
          </h3>
          <button 
            onClick={() => onSwitchView('list-view')}
            className="small-text font-bold text-[#6D5EF8] hover:underline flex items-center gap-1"
          >
            View Directory <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedDisplayTasks.slice(0, 4).map((task) => {
            const elapsed = getElapsedSeconds(task);
            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-purple-50/50 px-3.5 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-purple-100 gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-[#6D5EF8]">{task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {task.category || 'Planned Work'}
                    </span>
                    {/* Show time worked inline */}
                    {elapsed > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        task.timerRunning 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        ⏱ {formatTime(elapsed)}
                      </span>
                    )}
                  </div>
                  <h4 className="body-text font-bold text-[#202124] dark:text-slate-100 hover:text-[#6D5EF8]">{task.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>📁 {task.project}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-[#6D5EF8] dark:text-purple-300 font-extrabold border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                      👤 Assignee: <strong className="text-[#6D5EF8] dark:text-purple-200">{typeof task.assignee === 'object' ? task.assignee?.name : (task.assignee || 'Unassigned')}</strong>
                    </span>

                    {task.teamLeader && (
                      <span className="text-slate-500 font-semibold">
                        👑 TL: <span className="text-slate-700 dark:text-slate-300">{task.teamLeader}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className={`small-text font-bold px-3 py-1 rounded-full border ${
                    task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {task.priority} Priority
                  </span>

                  <span className={`small-text font-extrabold px-3 py-1 rounded-full border ${
                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
