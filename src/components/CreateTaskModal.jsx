import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Calendar, Clock, User, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function CreateTaskModal({ onClose, onCreateTask, onTriggerToast, employees = [], projects = [] }) {
  const getFutureFormatted = (days = 7) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [title, setTitle] = useState('');
  const [project, setProject] = useState(projects.length > 0 ? projects[0].name : '');
  const [category, setCategory] = useState('Embedded Software');
  const [priority, setPriority] = useState('High');
  const [assigneeId, setAssigneeId] = useState(employees.length > 0 ? employees[0].id : '');
  const [dueDate, setDueDate] = useState(getFutureFormatted(7));
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onTriggerToast('Please enter a task title', 'error');
      return;
    }

    const chosenAssignee = employees.find(e => e.id === assigneeId) || employees[0] || { id: 'unknown', name: 'Unassigned' };
    const selectedProjectObj = projects.find(p => p.name === project) || projects[0] || { id: 'unknown', name: 'No Project' };

    const newTask = {
      id: `TSK-${Math.floor(800 + Math.random() * 100)}`,
      title: title.trim(),
      project: project,
      projectId: selectedProjectObj.id,
      category: category,
      priority: priority,
      status: 'Pending',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: dueDate,
      actualTime: 0,
      assignee: chosenAssignee,
      assigneeName: chosenAssignee.name || 'Unassigned',
      assignedTo: chosenAssignee.id,
      assignedBy: 'Management',
      teamLeaderName: 'Management',
      creator: employees[0] || { id: 'unknown', name: 'System' },
      coAssignees: [],
      description: description.trim() || 'No detailed description provided.',
      checklists: [
        { id: `c-init-1`, text: 'Initial engineering review & setup', completed: false }
      ],
      attachments: [],
      comments: [],
      activity: [
        { id: `act-new-${Date.now()}`, action: 'Created Task', user: 'Vikram Sharma', timestamp: 'Just now' }
      ]
    };

    onCreateTask(newTask);
    onTriggerToast(`Task ${newTask.id} created successfully!`, 'success');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Create New Engineering Task</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Dispatch work order & set specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement CANopen Protocol Driver Interrupt Stack..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Project & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Target Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
              >
                {projects.length === 0 && <option value="">-- No projects yet --</option>}
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Engineering Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
              >
                <option value="Embedded Software">Embedded Software</option>
                <option value="Hardware & PCB">Hardware & PCB</option>
                <option value="SCADA & Software">SCADA & Software</option>
                <option value="Automation & Robotics">Automation & Robotics</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>
          </div>

          {/* Priority & Assignee Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Assign Engineer</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
              >
                {employees.length === 0 && <option value="">-- No employees yet --</option>}
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date Row */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Task Scope / Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline engineering requirements, safety standards, or acceptance criteria..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all active:scale-95 text-white"
            >
              Dispatch Task
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
