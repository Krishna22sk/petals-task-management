import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Bell, Plus, ChevronDown, Shield, X, LogOut, HelpCircle, Camera, Upload, User, Image } from 'lucide-react';
import { api } from '../services/api.js';

export default function Header({ 
  currentUser, 
  currentRole, 
  onOpenCreateTask, 
  onOpenEmployeeQuery,
  notifications,
  onOpenNotifications,
  searchQuery,
  onSearchChange,
  allTasks,
  onSelectTask,
  onLogout,
  onUpdateCurrentUser,
  onTriggerToast
}) {
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Avatar Upload Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const getAvatarUrl = (user) => {
    if (user?.avatar && typeof user.avatar === 'string' && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http') || user.avatar.startsWith('/'))) {
      return user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6D5EF8&color=fff&font-size=0.45`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedPhotoBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!selectedPhotoBase64) return;
    setIsSavingAvatar(true);
    try {
      const response = await api.updateProfile({ avatar: selectedPhotoBase64 });
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({ avatar: selectedPhotoBase64 });
      }
      if (onTriggerToast) onTriggerToast('Profile photo saved to database successfully! ✓', 'success');
      setShowAvatarModal(false);
      setSelectedPhotoBase64('');
    } catch (e) {
      if (onTriggerToast) onTriggerToast(`Failed to update profile photo: ${e.message}`, 'error');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const filteredSuggestions = searchQuery.trim() === '' ? [] : allTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const userNotifications = notifications.filter(n => {
    if (n.targetUserId || n.targetEmployeeEmail) {
      return (
        (n.targetUserId && n.targetUserId === currentUser?.id) ||
        (n.targetEmployeeEmail && n.targetEmployeeEmail.toLowerCase() === currentUser?.email?.toLowerCase())
      );
    }
    if (n.role) {
      return n.role === currentRole;
    }
    return true;
  });

  const unreadCount = userNotifications.filter(n => n.unread).length;

  return (
    <header className="bg-white sticky top-0 z-30 h-[72px] px-6 border-b border-slate-200/80 flex items-center justify-between gap-4">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchSuggestions(true);
            }}
            onFocus={() => setShowSearchSuggestions(true)}
            placeholder="Search tasks, projects, employees..."
            className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-[#FAFBFF] border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchSuggestions(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSearchSuggestions && filteredSuggestions.length > 0 && (
          <div 
            className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-soft-purple overflow-hidden z-50 animate-fade-in"
            onMouseLeave={() => setShowSearchSuggestions(false)}
          >
            <div className="p-2 space-y-1">
              {filteredSuggestions.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    setShowSearchSuggestions(false);
                  }}
                  className="p-3 hover:bg-purple-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-[#6D5EF8]">{task.taskCode || (task.id?.length > 15 ? `TSK-${task.id.slice(0,6).toUpperCase()}` : task.id)}</span>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#6D5EF8]">
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-500">{task.project}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-100 text-[#6D5EF8]">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Online Status, Bell, Assign Task, Profile */}
      <div className="flex items-center gap-3 text-xs">
        
        {/* Online Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Online</span>
        </div>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-[#6D5EF8]">
          <Shield className="w-3.5 h-3.5 text-[#6D5EF8]" />
          <span>Role: {currentRole}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6D5EF8] text-[10px] font-extrabold text-white shadow-md">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Employee Query Button (Employee Portal) */}
        {(currentRole?.toString().toLowerCase() === 'employee' || currentUser?.role?.toString().toLowerCase() === 'employee') && (
          <button
            onClick={onOpenEmployeeQuery}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D5EF8] border border-purple-200 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Submit or View Employee Queries to HR"
          >
            <HelpCircle className="w-4 h-4 text-[#6D5EF8]" />
            <span>Employee Query</span>
          </button>
        )}

        {/* Assign Task Button (TL/Admin) */}
        {currentRole !== 'Employee' && (
          <button
            onClick={onOpenCreateTask}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 btn-purple-gradient text-xs shadow-purple-btn transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <img
              src={getAvatarUrl(currentUser)}
              alt={currentUser?.name || 'User'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=6D5EF8&color=fff&font-size=0.45`;
              }}
              className="w-8 h-8 rounded-full object-cover border border-purple-200 shadow-xs"
            />
            <span className="hidden md:block text-xs font-semibold text-slate-900 text-left leading-tight">
              {currentUser?.name}
              <span className="block text-[10px] text-[#6D5EF8] font-bold">{currentRole}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-soft-purple py-2 z-50 animate-fade-in"
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowAvatarModal(true);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-[#6D5EF8] hover:bg-purple-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Upload Profile Photo
                </button>
                <button 
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* PROFILE PHOTO UPLOAD MODAL */}
      {showAvatarModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6D5EF8] flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upload Profile Photo</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Saved to DB & visible to HR, TL & team</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Avatar */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group">
                <img
                  src={selectedPhotoBase64 || getAvatarUrl(currentUser)}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-purple-200 shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=6D5EF8&color=fff&font-size=0.45`;
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#6D5EF8] text-white shadow-lg hover:bg-purple-700 transition-all cursor-pointer"
                  title="Choose image from PC"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D5EF8] font-bold text-xs border border-purple-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Choose Photo from PC
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSavingAvatar || !selectedPhotoBase64}
                className="px-5 py-2.5 btn-purple-gradient text-xs shadow-purple-btn font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingAvatar ? 'Saving to DB...' : 'Save & Update Profile Photo'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </header>
  );
}
