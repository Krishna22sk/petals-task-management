import React from 'react';
import { 
  CheckCircle2, Clock, MessageSquare, Paperclip, Plus, 
  Calendar, Layers, User 
} from 'lucide-react';

export default function TaskGridView({ tasks, onOpenTaskModal, onOpenCreateTask }) {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Task Grid Cards
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visual card-based responsive layout with task metric indicators
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Task
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const completedChecklists = task.checklists?.filter(c => c.completed).length || 0;
          const totalChecklists = task.checklists?.length || 0;

          return (
            <div
              key={task.id}
              onClick={() => onOpenTaskModal(task)}
              className="glass-panel p-6 rounded-3xl glass-card-hover cursor-pointer space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                
                {/* Header: Priority Badge & Status Chip */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    task.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {task.priority} Priority
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    task.status === 'Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {task.status}
                  </span>
                </div>

                {/* ID & Title */}
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{task.id}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {task.description}
                  </p>
                </div>

                {/* Checklist Progress */}
                {totalChecklists > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Sub-task Checklist</span>
                      <span>{Math.round((completedChecklists / totalChecklists) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                        style={{ width: `${(completedChecklists / totalChecklists) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={task.assignee?.avatar}
                    alt={task.assignee?.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                    {task.assignee?.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {task.attachments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> {task.attachments.length}
                    </span>
                  )}
                  {task.comments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> {task.comments.length}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
