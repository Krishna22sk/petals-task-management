import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function ReportsView({ currentUser, tasks = [], employees = [], onTriggerToast }) {
  const [reportRange, setReportRange] = useState('Monthly');
  const role = currentUser?.role || 'Admin';

  // Role-based task filtering for exports
  const scopedTasks = role === 'Employee'
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
    : role === 'Team Leader'
    ? tasks.filter(t => {
        const tlNameMatch = (t.assignedBy && currentUser?.name && t.assignedBy.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                            (t.teamLeaderName && currentUser?.name && t.teamLeaderName.toLowerCase().includes(currentUser.name.toLowerCase()));
        const tlIdMatch = (t.assignedById && t.assignedById === currentUser?.id);
        return tlNameMatch || tlIdMatch;
      })
    : tasks;

  const effectiveTasks = (role === 'Team Leader' && scopedTasks.length === 0) ? tasks : scopedTasks;

  // Excel / CSV Export Trigger Function
  const exportExcelReport = () => {
    if (!effectiveTasks || effectiveTasks.length === 0) {
      onTriggerToast('No tasks available for export', 'error');
      return;
    }

    const headers = [
      "S. NO",
      "EMPLOYEE NAME",
      "PROJECT NAME",
      "TASK NAME",
      "TASK DESCRIPTION",
      "EMPLOYEE DESCRIPTION",
      "WORK CATEGORY",
      "T L NAME",
      "TASK LEVEL",
      "TASK TYPE",
      "STATUS",
      "DUE DATE",
      "START DATE",
      "END DATE"
    ];

    const rows = effectiveTasks.map((t, idx) => {
      const empName = t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name) || currentUser?.name || 'KrishnaMoorthy';
      const projectName = t.project || 'AioTix';
      const taskName = t.title || t.taskName || '';
      const taskDesc = t.description || '';
      const empDesc = t.employeeDescription || t.completionNotes || '';
      const workCat = t.category || t.workCategory || 'Planned Work';
      const tlName = t.assignedBy || t.teamLeaderName || 'Karthikeyan';
      const levelStr = t.priority === 'High' ? 'High Level Task' : t.priority === 'Medium' ? 'Medium Level Task' : t.priority === 'Low' ? 'Low Level Task' : 'High Level Task';
      const taskType = t.taskType || 'Project';
      const status = t.status || 'In Progress';
      const dueDate = t.dueDate || '';
      const startDate = t.startDate || '';
      const endDate = t.endDate || (t.status === 'Completed' ? (t.dueDate || '-') : '-');

      return [
        `"${idx + 1}"`,
        `"${empName.replace(/"/g, '""')}"`,
        `"${projectName.replace(/"/g, '""')}"`,
        `"${taskName.replace(/"/g, '""')}"`,
        `"${taskDesc.replace(/"/g, '""')}"`,
        `"${empDesc.replace(/"/g, '""')}"`,
        `"${workCat.replace(/"/g, '""')}"`,
        `"${tlName.replace(/"/g, '""')}"`,
        `"${levelStr.replace(/"/g, '""')}"`,
        `"${taskType.replace(/"/g, '""')}"`,
        `"${status.replace(/"/g, '""')}"`,
        `"${dueDate.replace(/"/g, '""')}"`,
        `"${startDate.replace(/"/g, '""')}"`,
        `"${endDate.replace(/"/g, '""')}"`
      ].join(",");
    });

    const reportFileName = role === 'Employee'
      ? `My_Personal_Task_Report_${(currentUser?.name || 'Employee').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`
      : role === 'Team Leader'
      ? `TL_Team_Task_Report_${(currentUser?.name || 'TL').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`
      : `All_Employees_Task_Report_${new Date().toISOString().slice(0,10)}.csv`;

    const blob = new Blob(["\uFEFF" + headers.join(",") + "\n" + rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', reportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onTriggerToast(`Excel (.CSV) Task Report downloaded (${effectiveTasks.length} tasks)! 📊`, 'success');
  };

  // PDF Summary & Table Export Trigger Function
  const exportPdfReport = () => {
    if (!effectiveTasks || effectiveTasks.length === 0) {
      onTriggerToast('No tasks available for export', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    const tableRowsHtml = effectiveTasks.map((t, idx) => {
      const empName = t.assigneeName || (typeof t.assignee === 'string' ? t.assignee : t.assignee?.name) || currentUser?.name || 'KrishnaMoorthy';
      const projectName = t.project || 'AioTix';
      const taskName = t.title || t.taskName || '';
      const taskDesc = t.description || '';
      const empDesc = t.employeeDescription || t.completionNotes || '';
      const workCat = t.category || t.workCategory || 'Planned Work';
      const tlName = t.assignedBy || t.teamLeaderName || 'Karthikeyan';
      const levelStr = t.priority === 'High' ? 'High Level Task' : t.priority === 'Medium' ? 'Medium Level Task' : t.priority === 'Low' ? 'Low Level Task' : 'High Level Task';
      const taskType = t.taskType || 'Project';
      const status = t.status || 'In Progress';
      const dueDate = t.dueDate || '';
      const startDate = t.startDate || '';
      const endDate = t.endDate || (t.status === 'Completed' ? (t.dueDate || '-') : '-');

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${empName}</td>
          <td>${projectName}</td>
          <td><strong>${taskName}</strong></td>
          <td>${taskDesc}</td>
          <td>${empDesc}</td>
          <td>${workCat}</td>
          <td>${tlName}</td>
          <td>${levelStr}</td>
          <td>${taskType}</td>
          <td>${status}</td>
          <td>${dueDate}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Petals Automation — Task Audit Report</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; padding: 10px; }
          h2 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: top; word-break: break-word; }
          th { background-color: #e2e8f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>PETALS AUTOMATION PVT. LTD. — TASK MANAGEMENT REPORT</h2>
        <table>
          <thead>
            <tr>
              <th>S. NO</th>
              <th>EMPLOYEE NAME</th>
              <th>PROJECT NAME</th>
              <th>TASK NAME</th>
              <th>TASK DESCRIPTION</th>
              <th>EMPLOYEE DESCRIPTION</th>
              <th>WORK CATEGORY</th>
              <th>T L NAME</th>
              <th>TASK LEVEL</th>
              <th>TASK TYPE</th>
              <th>STATUS</th>
              <th>DUE DATE</th>
              <th>START DATE</th>
              <th>END DATE</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    onTriggerToast(`PDF Task Audit Report generated for printing (${effectiveTasks.length} tasks)! 📄`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Analytics & Audit Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate employee efficiency reports, export task logs to Excel/PDF
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportExcelReport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (CSV)
          </button>

          <button
            onClick={exportPdfReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export Summary PDF
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Task Completion Velocity</span>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">84.5%</h3>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs previous month
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Engineering Hours Logged</span>
          <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">890 Hours</h3>
          <p className="text-xs text-slate-500">Across 4 major active projects</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Average Sprint Efficiency</span>
          <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">93.8%</h3>
          <p className="text-xs text-emerald-600 font-semibold">Exceeds target threshold (90%)</p>
        </div>
      </div>

      {/* Detailed Team Performance Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Employee Performance Breakdown Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Engineer Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Assigned</th>
                <th className="p-3">Completed</th>
                <th className="p-3">Efficiency Score</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                    {emp.name}
                  </td>
                  <td className="p-3 text-slate-500">{emp.department}</td>
                  <td className="p-3 font-mono font-bold">{emp.assignedTasks}</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">{emp.completedTasks}</td>
                  <td className="p-3 font-bold text-blue-600">{emp.efficiencyScore}%</td>
                  <td className="p-3 text-right font-semibold text-emerald-600">Optimal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
