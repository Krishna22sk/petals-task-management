import React from 'react';
import { SlidersHorizontal, Plus, Clock } from 'lucide-react';

export default function TimelineView({ tasks, onOpenTaskModal, onOpenCreateTask }) {
  const datesHeader = ['Aug 01', 'Aug 03', 'Aug 05', 'Aug 08', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25', 'Aug 30'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Timeline & Gantt View
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sequential task execution schedules and project dependency timelines
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Task Bar
        </button>
      </div>

      {/* Gantt Timeline Panel */}
      <div className="glass-panel p-6 rounded-3xl overflow-x-auto space-y-4">
        
        {/* Timeline Header Row */}
        <div className="min-w-[800px] flex items-center border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className="w-1/3">Task Title & Assignee</div>
          <div className="w-2/3 grid grid-cols-9 text-center font-mono">
            {datesHeader.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
        </div>

        {/* Task Gantt Bars */}
        <div className="min-w-[800px] space-y-4 pt-2">
          {(tasks || []).map((task, idx) => {
            // Simulated start offset & span width based on index
            const leftOffsets = ['5%', '15%', '30%', '45%', '0%', '20%'];
            const barWidths = ['40%', '35%', '50%', '30%', '25%', '45%'];

            return (
              <div key={task.id} className="flex items-center group py-1">
                {/* Task Meta */}
                <div 
                  onClick={() => onOpenTaskModal(task)}
                  className="w-1/3 flex items-center gap-3 cursor-pointer pr-4"
                >
                  <img src={task.assignee?.avatar} alt={task.assignee?.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}: {task.title}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate">{task.project}</p>
                  </div>
                </div>

                {/* Timeline Bar Container */}
                <div className="w-2/3 relative h-8 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl overflow-hidden flex items-center p-1">
                  <div
                    onClick={() => onOpenTaskModal(task)}
                    style={{ 
                      marginLeft: leftOffsets[idx % leftOffsets.length], 
                      width: barWidths[idx % barWidths.length] 
                    }}
                    className={`h-full rounded-lg px-3 flex items-center justify-between text-[11px] font-bold text-white shadow-md cursor-pointer transition-all hover:brightness-110 ${
                      task.status === 'Completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      task.priority === 'Critical' ? 'bg-gradient-to-r from-red-600 to-amber-500' :
                      'bg-gradient-to-r from-blue-600 to-cyan-500'
                    }`}
                  >
                    <span className="truncate">{task.title}</span>
                    <span className="text-[9px] font-mono bg-black/20 px-1.5 py-0.5 rounded ml-2">{task.dueDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
