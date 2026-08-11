import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckSquare, Clock, Paperclip, MessageSquare, Plus, 
  Send, Calendar, User, Tag, Trash2, CheckCircle2, History, AlertCircle, FileCheck 
} from 'lucide-react';

export default function TaskDetailModal({ 
  task, 
  onClose, 
  onUpdateTask,
  currentUser,
  onTriggerToast 
}) {
  if (!task) return null;

  const role = currentUser.role || 'Employee';

  const [newRemarkText, setNewRemarkText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [proofFile, setProofFile] = useState(null);

  // Status Change Handler
  const handleStatusChange = (newStatus) => {
    onUpdateTask({ ...task, status: newStatus });
    onTriggerToast(`Task status updated to "${newStatus}"`, 'success');
  };

  // Add Remark Handler
  const handleAddRemark = (e) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;

    const newRemark = {
      id: `rem-${Date.now()}`,
      author: currentUser.name,
      text: newRemarkText.trim(),
      timestamp: new Date().toLocaleString()
    };

    const updatedRemarks = [...(task.remarks || []), newRemark];
    onUpdateTask({ ...task, remarks: updatedRemarks });
    setNewRemarkText('');
    onTriggerToast('Remark added to task history', 'success');
  };

  // Upload Proof of Work Attachment Handler
  const handleUploadProof = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newProof = {
        id: `prf-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().slice(0, 10)
      };

      const updatedProofs = [...(task.proofAttachments || []), newProof];
      onUpdateTask({ ...task, proofAttachments: updatedProofs });
      onTriggerToast(`Proof of work file "${file.name}" uploaded!`, 'success');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-end animate-fade-in">
      
      {/* Slide-over Drawer Panel */}
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-xl">
              {task.id}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
              task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
              'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {task.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Title & Project Info */}
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {task.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>Project: <strong className="text-blue-600 dark:text-blue-400">{task.project}</strong></span>
              <span>•</span>
              <span>TL: <strong>{task.teamLeaderName || 'Rajesh Kulkarni'}</strong></span>
            </div>
          </div>

          {/* Quick Status Change Buttons */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/50 border border-blue-200/60 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Update Status:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('In Progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  task.status === 'In Progress' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-200'
                }`}
              >
                In Progress
              </button>

              <button
                onClick={() => handleStatusChange('Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  task.status === 'Completed' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-emerald-600 border border-emerald-200'
                }`}
              >
                Completed
              </button>

              <button
                onClick={() => handleStatusChange('On Hold')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  task.status === 'On Hold' ? 'bg-amber-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-amber-600 border border-amber-200'
                }`}
              >
                On Hold
              </button>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 text-xs">
            <div>
              <span className="text-slate-400">Category</span>
              <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">{task.category || 'Planned Work'}</p>
            </div>
            <div>
              <span className="text-slate-400">Task Level</span>
              <p className="mt-1 font-bold text-blue-600 dark:text-blue-400">{task.taskLevel || 'High'}</p>
            </div>
            <div>
              <span className="text-slate-400">Task Type</span>
              <p className="mt-1 font-bold text-cyan-600 dark:text-cyan-400">{task.taskType || 'Project'}</p>
            </div>
            <div>
              <span className="text-slate-400">Priority</span>
              <p className="mt-1 font-bold text-red-600 dark:text-red-400">{task.priority}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description / Requirements</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {task.description}
            </p>
          </div>

          {/* Remarks Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-500" /> Employee Comments / Remarks ({(task.comments || task.remarks || []).length})
            </h4>

            <div className="space-y-2">
              {(task.comments || task.remarks || []).map((rem) => (
                <div key={rem.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{rem.author || rem.author_name || 'System User'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rem.createdAt || rem.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{rem.text || rem.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Remark Input */}
            <form onSubmit={handleAddRemark} className="flex gap-2">
              <input
                type="text"
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                placeholder="Add your progress remark or daily update..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                Add Remark
              </button>
            </form>
          </div>

          {/* Proof Attachments Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-500" /> Uploaded Attachments ({(task.attachments || task.proofAttachments || []).length})
              </h4>
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Upload Proof
                <input type="file" onChange={handleUploadProof} className="hidden" />
              </label>
            </div>

            <div className="space-y-2">
              {(task.attachments || task.proofAttachments || []).map((prf) => (
                <div key={prf.id} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{prf.name || prf.file_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{prf.uploadedAt || prf.uploadDate}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
