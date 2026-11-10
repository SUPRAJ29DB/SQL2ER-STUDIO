import React from 'react';
import { Database, Sparkles, LayoutGrid, Code, Sliders, Play, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const Navbar = () => {
  const {
    currentPage,
    setCurrentPage,
    activeConnection,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    backendHealthy,
  } = useAppStore();

  const navItems = [
    { id: 'workspace', label: 'Workspace', icon: Code },
    { id: 'er-designer', label: 'ER Designer', icon: LayoutGrid },
    { id: 'home', label: 'Overview', icon: Database },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="h-14 bg-[#0b1120] border-b border-slate-800 flex items-center justify-between px-4 z-40 select-none">
      {/* Brand */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentPage('workspace')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Database className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-bold tracking-tight text-white text-base">SQL2ER</span>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">Studio</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Backend health status badge */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
          backendHealthy
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {backendHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{backendHealthy ? 'API Online' : 'Offline'}</span>
        </div>

        {/* Active DB indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>{activeConnection ? activeConnection.name : 'Local SQLite'}</span>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            isAIAssistantOpen
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800 text-indigo-300 hover:bg-slate-700 border border-indigo-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  );
};

