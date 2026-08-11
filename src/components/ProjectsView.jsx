import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FolderKanban, Plus, Calendar, Clock, Users, Trash2, Edit, 
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X 
} from 'lucide-react';

export default function ProjectsView({ 
  currentUser,
  projects, 
  onAddProject, 
  onUpdateProject, 
  onDeleteProject,
  onTriggerToast 
}) {
  const role = currentUser.role || 'Employee';
  const isAdmin = role === 'Admin';
  const canManageProjects = role === 'Admin' || role === 'Team Leader';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // New Project Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Embedded Systems');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [teamLead, setTeamLead] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      onTriggerToast('Please enter project name and code', 'error');
      return;
    }

    const parsedTechStack = techStackInput.trim()
      ? techStackInput.split(',').map(t => t.trim()).filter(t => t)
      : ['General'];

    const newPrj = {
      id: `prj-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category: category,
      status: 'Active',
      progress: 0,
      deadline: deadline,
      teamLead: teamLead.trim() || currentUser.name || 'Team Leader',
      membersCount: 1,
      loggedHours: 0,
      techStack: parsedTechStack,
      description: description.trim() || 'Industrial automation engineering project.'
    };

    onAddProject(newPrj);
    onTriggerToast(`Project ${newPrj.code} created successfully!`, 'success');
    setShowAddModal(false);
    setName('');
    setCode('');
    setTeamLead('');
    setTechStackInput('');
    setDescription('');
  };

  const toggleProjectStatus = (prj) => {
    const nextStatus = prj.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateProject({ ...prj, status: nextStatus });
    onTriggerToast(`Project ${prj.code} status changed to ${nextStatus}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#6D5EF8]" /> Project Management Directory
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            {canManageProjects 
              ? 'Manage company project lifecycles, add new initiatives, edit specifications, or toggle active/inactive status.' 
              : 'Track active hardware, firmware, and SCADA automation projects.'}
          </p>
        </div>

        {canManageProjects && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95 text-white"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <FolderKanban className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No Projects Yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md">
            {canManageProjects 
              ? 'Click "Add New Project" above to create your first project and start managing tasks.' 
              : 'No projects have been created yet. Contact your Admin or Team Leader to set up projects.'}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((prj) => (
          <div
            key={prj.id}
            className={`glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all ${
              prj.status === 'Inactive' ? 'opacity-60 grayscale' : 'glass-card-hover'
            }`}
          >
            <div className="space-y-3">
              
              {/* Header Badges & Admin Controls */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {prj.code}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    prj.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {prj.status}
                  </span>

                  {canManageProjects && (
                    <button
                      onClick={() => toggleProjectStatus(prj)}
                      className="p-1 text-slate-400 hover:text-[#6D5EF8]"
                      title="Toggle Active/Inactive"
                    >
                      {prj.status === 'Active' ? (
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  )}

                  {canManageProjects && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete project ${prj.name}?`)) {
                          onDeleteProject(prj.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {prj.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {prj.description}
                </p>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(prj.techStack || ['General']).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress Meter */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Project Completion Progress</span>
                  <span className="text-blue-600 dark:text-blue-400">{prj.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${prj.progress}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Footer Meta */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-4 h-4 text-blue-500" /> Lead: {prj.teamLead}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" /> Due {prj.deadline}
              </div>
            </div>

          </div>
        ))}
      </div>
      )}

      {/* Admin Add Project Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Add New Project</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Create project initiative & set timeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Project Code (e.g. PET-ROB-05)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PET-MOT-09"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Industrial SCADA Sensor Monitoring Platform"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all cursor-pointer font-bold"
                  >
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="Hardware & PCB">Hardware & PCB</option>
                    <option value="SCADA & Software">SCADA & Software</option>
                    <option value="Automation & Robotics">Automation & Robotics</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Team Lead Name</label>
                <input
                  type="text"
                  value={teamLead}
                  onChange={(e) => setTeamLead(e.target.value)}
                  placeholder="e.g. Rajesh Kulkarni"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, Node.js, Embedded C, STM32"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project goals & scope..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all active:scale-95 text-white"
                >
                  Save Project Initiative
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
