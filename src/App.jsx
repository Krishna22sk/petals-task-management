import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import DashboardView from './components/DashboardView';
import AssignTaskForm from './components/AssignTaskForm';
import TaskListView from './components/TaskListView';
import CalendarView from './components/CalendarView';
import ProjectsView from './components/ProjectsView';
import EmployeesView from './components/EmployeesView';
import ReportsView from './components/ReportsView';
import ActivityLogView from './components/ActivityLogView';
import SettingsView from './components/SettingsView';
import TaskDetailModal from './components/TaskDetailModal';
import NotificationDrawer from './components/NotificationDrawer';
import ToastNotification from './components/ToastNotification';
import EmployeeQueryModal from './components/EmployeeQueryModal';
import QueriesView from './components/QueriesView';
import { api } from './services/api';

import { 
  MOCK_USERS
} from './data/mockData';

export default function App() {
  // Authentication & Current User State (Starts at Login Screen!)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Theme & Layout State
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  // Core Business Data Collections (Always fetched from REST API — never initialized with mock data)
  const [users, setUsers] = useState(MOCK_USERS);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [queries, setQueries] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(!!localStorage.getItem('petals_jwt_token'));

  // UI Modals & Popups
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Dark Mode Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Restore logged-in user session on page refresh (F5)
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('petals_jwt_token');
      if (token) {
        try {
          const res = await api.getCurrentUser();
          const userObj = res.user || res.data || res;
          if (userObj && userObj.id) {
            setCurrentUser(userObj);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('petals_jwt_token');
          }
        } catch (e) {
          localStorage.removeItem('petals_jwt_token');
        }
      }
      setIsCheckingSession(false);
    };
    checkSession();
  }, []);

  // Fetch initial business data from Express REST API backend on startup and authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }
  }, [isAuthenticated]);

  const fetchBackendData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedTasks, fetchedProjects, fetchedEmployees, fetchedNotifications, fetchedQueries, fetchedLogs] = await Promise.allSettled([
        api.getTasks(),
        api.getProjects(),
        api.getEmployees(),
        api.getNotifications(),
        api.getQueries(),
        api.getActivityLogs(),
      ]);

      if (fetchedTasks.status === 'fulfilled' && Array.isArray(fetchedTasks.value)) {
        setTasks(fetchedTasks.value);
      }
      if (fetchedProjects.status === 'fulfilled' && Array.isArray(fetchedProjects.value)) {
        setProjects(fetchedProjects.value);
      }
      if (fetchedEmployees.status === 'fulfilled' && Array.isArray(fetchedEmployees.value)) {
        setEmployees(fetchedEmployees.value);
      }
      if (fetchedNotifications.status === 'fulfilled' && Array.isArray(fetchedNotifications.value)) {
        setNotifications(fetchedNotifications.value);
      }
      if (fetchedQueries.status === 'fulfilled' && Array.isArray(fetchedQueries.value)) {
        setQueries(fetchedQueries.value);
      }
      if (fetchedLogs.status === 'fulfilled' && Array.isArray(fetchedLogs.value)) {
        setActivities(fetchedLogs.value);
      }
    } catch (err) {
      console.warn('API data fetch error:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Login Success Handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveView('dashboard');
    triggerToast(`Logged in as ${user.name} (${user.role})`, 'success');
  };

  // Log Out Handler
  const handleLogout = () => {
    api.logout().catch(() => {});
    setIsAuthenticated(false);
    setCurrentUser(null);
    triggerToast('Signed out successfully', 'info');
  };

  // Toast Helper
  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // TASK CRUD HANDLERS
  const handleAssignTask = async (newTask) => {
    try {
      const created = await api.createTask(newTask);
      setTasks(prev => [created, ...prev]);
      triggerToast(`Task "${created.title || newTask.title}" assigned successfully`, 'success');
      setActiveView('list-view');
    } catch (e) {
      triggerToast(`Failed to assign task: ${e.message}`, 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      triggerToast(`Task status moved to "${newStatus}"`, 'success');
    } catch (e) {
      triggerToast(`Failed to update task status: ${e.message}`, 'error');
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const saved = await api.updateTask(updatedTask.id, updatedTask);
      const prjTask = {
        ...(saved || updatedTask),
        timerRunning: updatedTask.timerRunning,
        timerStartedAt: updatedTask.timerStartedAt,
        elapsedSeconds: updatedTask.elapsedSeconds,
      };
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? prjTask : t));
      if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(prjTask);
      }
      triggerToast('Task updated successfully', 'success');
    } catch (e) {
      triggerToast(`Failed to update task: ${e.message}`, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await api.deleteTask(taskId);
      const targetId = res?.deletedId || taskId;
      setTasks(prev => prev.filter(t => t.id !== targetId && t.id !== taskId && t.taskCode !== taskId));
      triggerToast(`Task deleted successfully from database ✓`, 'info');
    } catch (e) {
      triggerToast(`Failed to delete task: ${e.message}`, 'error');
    }
  };

  // PROJECT CRUD HANDLERS
  const handleAddProject = async (newProject) => {
    try {
      const created = await api.createProject(newProject);
      setProjects(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      triggerToast(`Project "${created.name}" created successfully`, 'success');
    } catch (e) {
      triggerToast(`Failed to create project: ${e.message}`, 'error');
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      const saved = await api.updateProject(updatedProject.id, updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? (saved || updatedProject) : p));
      triggerToast('Project updated successfully', 'success');
    } catch (e) {
      triggerToast(`Failed to update project: ${e.message}`, 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      triggerToast('Project deleted', 'info');
    } catch (e) {
      triggerToast(`Failed to delete project: ${e.message}`, 'error');
    }
  };

  // EMPLOYEE CRUD HANDLERS
  const handleAddEmployee = async (newEmployee) => {
    try {
      const created = await api.createEmployee(newEmployee);
      setEmployees(prev => [created, ...prev.filter(e => e.id !== created.id)]);
      triggerToast(`Employee "${created.name}" created successfully`, 'success');
    } catch (e) {
      triggerToast(`Failed to create employee: ${e.message}`, 'error');
    }
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      const saved = await api.updateEmployee(updatedEmployee.id, updatedEmployee);
      setEmployees(employees.map(e => e.id === updatedEmployee.id ? (saved || updatedEmployee) : e));
      triggerToast('Employee record updated', 'success');
    } catch (e) {
      triggerToast(`Failed to update employee: ${e.message}`, 'error');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await api.deleteEmployee(employeeId);
      setEmployees(employees.filter(e => e.id !== employeeId));
      triggerToast('Employee record deleted', 'info');
    } catch (e) {
      triggerToast(`Failed to delete employee: ${e.message}`, 'error');
    }
  };

  // QUERY CRUD & NOTIFICATION HANDLERS
  const handleSubmitQuery = async (newQuery) => {
    try {
      const created = await api.submitQuery(newQuery);
      setQueries(prev => [created, ...prev]);
      triggerToast('Support query submitted successfully', 'success');
    } catch (e) {
      triggerToast(`Failed to submit query: ${e.message}`, 'error');
    }
  };

  const handleReplyQuery = async (updatedQuery) => {
    try {
      if (updatedQuery.reply?.text) {
        const saved = await api.replyQuery(updatedQuery.id, updatedQuery.reply.text);
        setQueries(prev => prev.map(q => q.id === updatedQuery.id ? (saved || updatedQuery) : q));
        triggerToast('Reply sent successfully', 'success');
      }
    } catch (e) {
      triggerToast(`Failed to reply to query: ${e.message}`, 'error');
    }
  };

  const handleUpdateCurrentUser = (updatedUserData) => {
    setCurrentUser(prev => {
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('petals_user', JSON.stringify(newUser));
      return newUser;
    });
    if (updatedUserData?.avatar) {
      setEmployees(prev => prev.map(emp => {
        if (emp.email === updatedUserData.email || emp.id === updatedUserData.id || emp.name === updatedUserData.name) {
          return { ...emp, avatar: updatedUserData.avatar };
        }
        return emp;
      }));
    }
  };

  // Filter notifications strictly for the logged-in user session
  const userNotifications = notifications.filter(n => {
    if (n.targetUserId || n.targetEmployeeEmail) {
      return (
        (n.targetUserId && n.targetUserId === currentUser?.id) ||
        (n.targetEmployeeEmail && n.targetEmployeeEmail.toLowerCase() === currentUser?.email?.toLowerCase())
      );
    }
    if (n.role) {
      return n.role === currentUser?.role;
    }
    return true;
  });

  // RENDER LOADING SCREEN WHILE CHECKING SESSION
  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full bg-[#FAFBFF] flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D5EF8] to-[#8B7BFF] flex items-center justify-center text-white text-2xl shadow-lg animate-pulse mb-4">
          🌸
        </div>
        <div className="text-sm font-bold text-slate-700">Loading Petals Automation...</div>
      </div>
    );
  }

  // RENDER LOGIN PAGE IF NOT AUTHENTICATED
  if (!isAuthenticated || !currentUser) {
    return <LoginPage users={users} employees={employees} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex transition-colors duration-300 overflow-x-hidden">

      
      {/* Role-Aware Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        onSelectView={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        taskCounts={{ 
          total: tasks.length,
          pendingQueries: queries.filter(q => q.status === 'Pending').length
        }}
      />

      {/* Main Workspace Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        
        {/* Sticky Header with User Profile & Logout */}
        <Header
          currentUser={currentUser}
          currentRole={currentUser.role}
          onRoleChange={() => {}}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenCreateTask={() => {
            if (currentUser.role === 'Employee') {
              triggerToast('Employees cannot assign tasks. Contact your Team Leader.', 'error');
            } else {
              setActiveView('assign-task');
            }
          }}
          onOpenEmployeeQuery={() => setShowQueryModal(true)}
          notifications={userNotifications}
          onOpenNotifications={() => setShowNotificationDrawer(!showNotificationDrawer)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allTasks={tasks}
          onSelectTask={(task) => setSelectedTask(task)}
          onLogout={handleLogout}
          onUpdateCurrentUser={handleUpdateCurrentUser}
          onTriggerToast={triggerToast}
        />

        {/* Notifications Dropdown */}
        {showNotificationDrawer && (
          <NotificationDrawer
            notifications={userNotifications}
            onClose={() => setShowNotificationDrawer(false)}
            onMarkAllRead={async () => {
              const userNotifIds = new Set(userNotifications.map(n => n.id));
              setNotifications(prev => prev.map(n => userNotifIds.has(n.id) ? { ...n, unread: false } : n));
              try {
                await api.markNotificationsRead();
                triggerToast('All notifications marked as read in database ✓', 'info');
              } catch (e) {
                console.error('Failed to mark notifications read in DB:', e);
              }
            }}
          />
        )}

        {/* View Router */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {activeView === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              tasks={tasks}
              employees={employees}
              projects={projects}
              activities={activities}
              onOpenTaskModal={(task) => setSelectedTask(task)}
              onSwitchView={setActiveView}
            />
          )}

          {activeView === 'assign-task' && (
            <AssignTaskForm
              currentUser={currentUser}
              employees={employees}
              projects={projects}
              onAssignTask={handleAssignTask}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'list-view' && (
            <TaskListView
              currentUser={currentUser}
              tasks={tasks}
              onOpenTaskModal={(task) => setSelectedTask(task)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onSwitchView={setActiveView}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              currentUser={currentUser}
              tasks={tasks}
              onOpenTaskModal={(task) => setSelectedTask(task)}
              onOpenCreateTask={() => setActiveView('assign-task')}
            />
          )}

          {activeView === 'queries' && (
            <QueriesView
              currentUser={currentUser}
              queries={queries}
              onReplyQuery={handleReplyQuery}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsView
              currentUser={currentUser}
              projects={projects}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'employees' && (
            <EmployeesView
              currentUser={currentUser}
              employees={employees}
              tasks={tasks}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView
              currentUser={currentUser}
              tasks={tasks}
              employees={employees}
              onTriggerToast={triggerToast}
            />
          )}

          {activeView === 'activity-log' && (
            <ActivityLogView activities={activities} />
          )}

          {activeView === 'settings' && (
            <SettingsView onTriggerToast={triggerToast} />
          )}

        </main>
      </div>

      {/* Employee Query Modal */}
      {showQueryModal && (
        <EmployeeQueryModal
          currentUser={currentUser}
          queries={queries}
          onClose={() => setShowQueryModal(false)}
          onSubmitQuery={handleSubmitQuery}
          onTriggerToast={triggerToast}
        />
      )}

      {/* Task Detail Slide-over Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          currentUser={currentUser}
          onTriggerToast={triggerToast}
        />
      )}

      {/* Floating System Toast */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
