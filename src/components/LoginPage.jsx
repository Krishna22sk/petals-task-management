import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';
import { api } from '../services/api';


export default function LoginPage({ onLoginSuccess, users = [], employees = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Build unified authentication list combining MOCK_USERS, users state, and created employees
  const accountMap = new Map();

  // Add default system admin / team leader accounts first
  MOCK_USERS.forEach(u => accountMap.set(u.email.toLowerCase(), u));

  // Add dynamic users state
  (users || []).forEach(u => {
    if (u && u.email) accountMap.set(u.email.toLowerCase(), u);
  });

  // Add dynamic employees state
  (employees || []).forEach(emp => {
    if (emp && emp.email) {
      accountMap.set(emp.email.toLowerCase(), {
        id: emp.id,
        email: emp.email,
        password: emp.password || '123456',
        name: emp.name,
        role: emp.role || 'Employee',
        designation: emp.designation,
        department: emp.department,
        avatar: emp.avatar
      });
    }
  });

  const DELETED_EMAILS = ['employee@petals.com', 'david@petals.com'];
  const allAccounts = Array.from(accountMap.values()).filter(
    acc => acc && acc.email && !DELETED_EMAILS.includes(acc.email.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanInputEmail = email.trim().toLowerCase();
    const cleanInputPass = password.trim() || '123456';

    if (!cleanInputEmail) {
      setError('Please enter your work email address.');
      return;
    }

    try {
      const response = await api.login(cleanInputEmail, cleanInputPass);
      if (response && response.user && response.token) {
        localStorage.setItem('petals_jwt_token', response.token);
        onLoginSuccess(response.user);
        return;
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return;
    }
  };

  const handleQuickFill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFBFF] text-[#202124] flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDE: Mutmiz Soft Lavender Hero Panel */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-[#F3F1FF] via-[#ECE8FF] to-[#E5E0FF] p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        
        {/* Soft Blurred Gradient Circles */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D5EF8] to-[#8B7BFF] flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/30">
            🌸
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#202124]">Petals Automation</h2>
            <span className="text-[11px] font-bold text-[#6D5EF8] uppercase tracking-widest block">Soft SaaS Platform OS</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 my-auto py-12">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-purple-200 text-xs font-extrabold text-[#6D5EF8] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Enterprise Task Infrastructure
            </span>
            <h1 className="hero-title text-[#202124] tracking-tight leading-tight">
              Luxurious Workflows, Built for Modern SaaS.
            </h1>
            <p className="body-text text-slate-600 font-medium leading-relaxed">
              Track firmware drivers, PCB thermal simulations, and SCADA industrial automation tasks with full audit visibility.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="soft-card p-5 space-y-1">
              <span className="text-3xl font-extrabold text-[#202124]">42 Tasks</span>
              <p className="small-text text-slate-500 font-semibold">Completed this sprint</p>
            </div>
            <div className="soft-card p-5 space-y-1">
              <span className="text-3xl font-extrabold text-[#6D5EF8]">96% Velocity</span>
              <p className="small-text text-slate-500 font-semibold">On-time sprint score</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 small-text text-slate-500 font-medium">
          © 2026 Petals Automation. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Mutmiz Pure White Card Login Form */}
      <div className="lg:w-1/2 p-6 lg:p-16 flex items-center justify-center bg-[#FAFBFF]">
        <div className="w-full max-w-md space-y-6">
          
          <div className="soft-card space-y-6">
            <div className="space-y-1 text-left">
              <h3 className="section-title text-[#202124]">
                Sign in to your account
              </h3>
              <p className="small-text text-slate-500 font-medium">
                Enter your credentials or click an account below to auto-fill
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 small-text font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 small-text">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@petals.com"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#6D5EF8] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between small-text pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#6D5EF8] focus:ring-[#6D5EF8]"
                  />
                  <span>Remember me</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset dispatched to your work email.'); }} 
                  className="text-[#6D5EF8] font-bold hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl btn-purple-gradient text-sm shadow-purple-btn transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Select Account ({allAccounts.length}):</span>
                <span className="text-[#6D5EF8]">Click to fill</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 small-text">
                {allAccounts.map((acc, index) => (
                  <div 
                    key={acc.id || index}
                    onClick={() => handleQuickFill(acc.email, acc.password || '123456')} 
                    className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:border-[#6D5EF8] cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex-shrink-0 ${
                        acc.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        acc.role === 'Team Leader' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {acc.role || 'Employee'}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 group-hover:text-[#6D5EF8] truncate">{acc.email}</p>
                        <p className="text-[10px] text-slate-500 truncate">{acc.name} ({acc.designation || acc.department || 'Staff'})</p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-slate-600 flex-shrink-0 ml-2">pass: {acc.password || '123456'}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
