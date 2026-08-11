import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, RotateCcw } from 'lucide-react';

export default function CalendarView({ currentUser, tasks = [], onOpenTaskModal, onOpenCreateTask }) {
  const role = currentUser?.role || 'Employee';
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth(); // 0-indexed
  const todayDate = today.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(todayMonth);

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(todayYear);
    setCurrentMonthIdx(todayMonth);
  };

  // Calculate days in month and starting day offset
  const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 = Sun
  const daysInMonthCount = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#6D5EF8]" /> Task Calendar Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly interactive task delivery milestones & deadline schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[120px] text-center font-extrabold">{monthNames[currentMonthIdx]} {currentYear}</span>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetToToday}
            className="px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D5EF8] font-bold text-xs border border-purple-200 transition-all flex items-center gap-1.5"
            title="Jump to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Today
          </button>

          {role !== 'Employee' && (
            <button
              onClick={onOpenCreateTask}
              className="px-4 py-2.5 rounded-xl btn-purple-gradient text-white font-bold text-sm shadow-purple-btn flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Schedule Task
            </button>
          )}
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800/80">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-center py-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/40 dark:bg-slate-950/40">
          
          {/* Leading Empty Cells for Starting Day of Week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-slate-50/40 dark:bg-slate-900/20" />
          ))}

          {daysInMonth.map((day) => {
            const mStr = String(currentMonthIdx + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const dateStr = `${currentYear}-${mStr}-${dStr}`;

            const activeDayTasks = tasks.filter(t => {
              const sDate = t.startDate || dateStr;
              const eDate = t.dueDate || dateStr;

              if (t.status === 'Completed') {
                const compDate = t.completedAt ? t.completedAt.slice(0, 10) : sDate;
                return dateStr === compDate || dateStr === sDate;
              }

              return dateStr >= sDate && dateStr <= eDate;
            });

            const isToday = day === todayDate && currentMonthIdx === todayMonth && currentYear === todayYear;

            return (
              <div
                key={day}
                className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-purple-50/80 dark:bg-purple-950/40 font-bold border-2 border-[#6D5EF8]/40' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs w-6 h-6 rounded-full flex items-center justify-center font-extrabold ${
                    isToday ? 'bg-[#6D5EF8] text-white shadow-md' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day}
                  </span>
                  {activeDayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-[#6D5EF8]">
                      {activeDayTasks.length} task{activeDayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-1 overflow-y-auto max-h-[75px]">
                  {activeDayTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';
                    const isStart = (task.startDate || dateStr) === dateStr;
                    const isEnd = (task.dueDate || dateStr) === dateStr;

                    const displayCode = task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0, 6).toUpperCase()}` : task.id);
                    let badgeClass = 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200';
                    let badgeLabel = `⏳ ${displayCode}`;

                    if (isCompleted) {
                      badgeClass = 'bg-emerald-500 text-white font-extrabold shadow-sm';
                      badgeLabel = `✅ Done: ${displayCode}`;
                    } else if (isStart && isEnd) {
                      badgeClass = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold border border-amber-200';
                      badgeLabel = `▶️🏁 ${displayCode}`;
                    } else if (isStart) {
                      badgeClass = 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200 font-extrabold border border-blue-300';
                      badgeLabel = `▶️ Start: ${displayCode}`;
                    } else if (isEnd) {
                      badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold border border-emerald-300';
                      badgeLabel = `🏁 End: ${displayCode}`;
                    }

                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskModal(task)}
                        className={`p-1.5 rounded-lg text-[10px] font-semibold cursor-pointer truncate shadow-sm transition-transform hover:scale-105 ${badgeClass}`}
                        title={`${task.title} | Status: ${task.status} | Start: ${task.startDate || '—'} -> End: ${task.dueDate || '—'} | Assignee: ${typeof task.assignee === 'object' ? task.assignee?.name : task.assignee}`}
                      >
                        <p className="font-bold truncate">{badgeLabel}</p>
                        <p className="text-[9px] opacity-90 truncate">{task.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
