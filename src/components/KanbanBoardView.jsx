import React, { useState } from 'react';
import { 
  Plus, CheckSquare, MessageSquare, Paperclip, Clock, 
  ChevronLeft, ChevronRight, MoreHorizontal, AlertCircle 
} from 'lucide-react';

export default function KanbanBoardView({ 
  tasks, 
  onOpenTaskModal, 
  onUpdateTaskStatus,
  onOpenCreateTask 
}) {
  const columns = [
    { id: 'Pending', label: 'Pending', color: 'border-slate-400 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'In Progress', label: 'In Progress', color: 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300' },
    { id: 'Review', label: 'Under Review', color: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300' },
    { id: 'Completed', label: 'Completed', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Interactive Kanban Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage engineering workflow stages with live card status shifting
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Task Card
        </button>
      </div>

      {/* 4-Column Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="glass-panel p-4 rounded-3xl space-y-4 min-h-[500px] flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border-2 ${col.color.split(' ')[0]}`} />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {col.label}
                    </h3>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${col.color}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${col.color.split(' ')[0].replace('border', 'bg')}`} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 dark:text-slate-600 text-xs">
                    No tasks in {col.label}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completedChecklists = task.checklists?.filter(c => c.completed).length || 0;
                    const totalChecklists = task.checklists?.length || 0;

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all group space-y-3"
                      >
                        {/* Task Priority & Quick Move Controls */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            task.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {task.priority}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Shift Left */}
                            {col.id !== 'Pending' && (
                              <button
                                onClick={() => {
                                  const prevStatus = col.id === 'Completed' ? 'Review' : col.id === 'Review' ? 'In Progress' : 'Pending';
                                  onUpdateTaskStatus(task.id, prevStatus);
                                }}
                                title="Move Left"
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* Shift Right */}
                            {col.id !== 'Completed' && (
                              <button
                                onClick={() => {
                                  const nextStatus = col.id === 'Pending' ? 'In Progress' : col.id === 'In Progress' ? 'Review' : 'Completed';
                                  onUpdateTaskStatus(task.id, nextStatus);
                                }}
                                title="Move Right"
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & ID */}
                        <div 
                          onClick={() => onOpenTaskModal(task)}
                          className="cursor-pointer space-y-1"
                        >
                          <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                            {task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {task.project}
                          </p>
                        </div>

                        {/* Checklist Meter */}
                        {totalChecklists > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                              <span>Checklist</span>
                              <span>{completedChecklists}/{totalChecklists}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(completedChecklists / totalChecklists) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer: Date, Attachments, Comments, Avatar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-3">
                            {task.attachments?.length > 0 && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Paperclip className="w-3.5 h-3.5" /> {task.attachments.length}
                              </span>
                            )}
                            {task.comments?.length > 0 && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <MessageSquare className="w-3.5 h-3.5" /> {task.comments.length}
                              </span>
                            )}
                          </div>

                          <img
                            src={task.assignee?.avatar}
                            alt={task.assignee?.name}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                            title={task.assignee?.name}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Inline Column Footer Add Card */}
              <button
                onClick={onOpenCreateTask}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Add Card
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
