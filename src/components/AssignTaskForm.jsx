import React, { useState } from 'react';
import { PlusCircle, UserCheck, FolderKanban, Calendar, Clock, Paperclip, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssignTaskForm({ onAssignTask, onTriggerToast, currentUser, employees = [], projects = [] }) {
  const getTodayFormatted = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getFutureFormatted = (days = 7) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [employeeId, setEmployeeId] = useState(employees.length > 0 ? employees[0].id : '');
  const [projectId, setProjectId] = useState(projects.length > 0 ? projects[0].id : '');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Planned Work'); // Planned Work, Extra Work, Bug Fix, Support
  const [taskLevel, setTaskLevel] = useState('High'); // High, Medium, Low
  const [taskType, setTaskType] = useState('Project'); // Project, Training, Support
  const [priority, setPriority] = useState('High'); // High, Medium, Low
  const [startDate, setStartDate] = useState(getTodayFormatted());
  const [endDate, setEndDate] = useState(getFutureFormatted(7));
  const [status, setStatus] = useState('In Progress'); // Default: In Progress
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      onTriggerToast('Please enter a task name', 'error');
      return;
    }
    if (employees.length === 0) {
      onTriggerToast('Please add employees first before assigning tasks', 'error');
      return;
    }
    if (projects.length === 0) {
      onTriggerToast('Please create a project first before assigning tasks', 'error');
      return;
    }

    const assignedEmp = employees.find(emp => emp.id === employeeId) || employees[0];
    const selectedPrj = projects.find(p => p.id === projectId) || projects[0];

    const newTask = {
      id: `TSK-${Math.floor(810 + Math.random() * 90)}`,
      title: taskName.trim(),
      project: selectedPrj.name,
      projectId: selectedPrj.id,
      category: category,
      taskLevel: taskLevel,
      taskType: taskType,
      priority: priority,
      status: status, // In Progress default
      startDate: startDate,
      dueDate: endDate,
      actualTime: 0,
      assignee: assignedEmp,
      assigneeId: assignedEmp.id || assignedEmp.userId,
      assignedTo: assignedEmp.id || assignedEmp.userId,
      assigneeName: assignedEmp.name || 'Employee',
      assignedBy: currentUser?.name || 'Management',
      teamLeaderName: currentUser?.name || 'Management',
      description: description.trim() || 'No additional description provided.',
      remarks: [],
      proofAttachments: attachment ? [{
        id: `att-${Date.now()}`,
        name: attachment.name,
        size: `${(attachment.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().slice(0, 10)
      }] : []
    };

    onAssignTask(newTask);
    onTriggerToast(`Task ${newTask.id} assigned to ${assignedEmp.name} successfully!`, 'success');

    // Reset Form
    setTaskName('');
    setDescription('');
    setAttachment(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-[#6D5EF8]" /> Assign New Task (Team Leader Portal)
        </h2>
        <p className="text-xs text-slate-500 font-semibold">
          Dispatch engineering tasks directly to team members with priority, level, and category tags
        </p>
      </div>

      {/* Main Glassmorphic Assignment Card Form */}
      <form onSubmit={handleSubmit} className="soft-card p-6 lg:p-8 rounded-3xl space-y-6">
        
        {/* Row 1: Employee & Project Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#6D5EF8]" /> Employee Name *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              {employees.length === 0 && <option value="">-- No employees added yet --</option>}
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-[#6D5EF8]" /> Project Name *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              {projects.filter(p => p.status === 'Active').length === 0 && <option value="">-- No active projects yet --</option>}
              {projects.filter(p => p.status === 'Active').map((prj) => (
                <option key={prj.id} value={prj.id}>
                  {prj.name} ({prj.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Task Name */}
        <div className="space-y-1.5 text-xs font-medium">
          <label className="font-bold text-slate-700">Task Name *</label>
          <input
            type="text"
            required
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. Implement CANopen Protocol Driver Interrupt Stack..."
            className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
          />
        </div>

        {/* Row 3: Task Description */}
        <div className="space-y-1.5 text-xs font-medium">
          <label className="font-bold text-slate-700">Task Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline task objectives, safety standards, acceptance criteria, or hardware bench instructions..."
            className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] resize-none"
          />
        </div>

        {/* Row 4: Dropdowns - Category, Task Level, Task Type, Priority */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Task Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              <option value="Planned Work">Planned Work</option>
              <option value="Extra Work">Extra Work</option>
              <option value="Bug Fix">Bug Fix</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Task Level</label>
            <select
              value={taskLevel}
              onChange={(e) => setTaskLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              <option value="Project">Project</option>
              <option value="Training">Training</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

        </div>

        {/* Row 5: Start Date, End Date, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">End Date (Due)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Status (Default)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] cursor-pointer"
            >
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

        </div>

        {/* Row 6: Attachment File Upload */}
        <div className="space-y-1.5 text-xs font-medium">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <Paperclip className="w-4 h-4 text-[#6D5EF8]" /> Attachment File (Optional)
          </label>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBFF] border border-slate-200">
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0] || null)}
              className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#6D5EF8] hover:file:bg-purple-100 cursor-pointer"
            />
            {attachment && (
              <span className="text-xs font-semibold text-emerald-600">
                {attachment.name}
              </span>
            )}
          </div>
        </div>

        {/* Submit Assign Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl btn-purple-gradient text-xs shadow-purple-btn font-bold active:scale-95 transition-all flex items-center gap-2 text-white"
          >
            <CheckCircle2 className="w-4 h-4" /> Assign Task Now
          </button>
        </div>

      </form>
    </div>
  );
}
