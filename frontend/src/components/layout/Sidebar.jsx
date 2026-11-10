import React from 'react';
import { Database, Table, ChevronLeft, ChevronRight, Plus, FolderOpen, Layers, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { DatabaseTree } from '../database/DatabaseTree';

export const Sidebar = ({ onOpenNewConnection, onOpenImportSql }) => {
  const {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    schemaDefinition,
    activeConnection,
  } = useAppStore();

  const tables = schemaDefinition?.tables || [];
  const relationships = schemaDefinition?.relationships || [];

  return (
    <aside
      className={`h-full bg-[#0b1120] border-r border-slate-800 transition-all duration-300 flex flex-col z-30 select-none ${
        isSidebarCollapsed ? 'w-12' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-slate-800/80">
        {!isSidebarCollapsed && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Schema Explorer</span>
          </span>
        )}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 ml-auto"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!isSidebarCollapsed ? (
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenNewConnection}
              className="flex items-center justify-center space-x-1 px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Plus className="w-3 h-3 text-indigo-400" />
              <span>Connect</span>
            </button>
            <button
              onClick={onOpenImportSql}
              className="flex items-center justify-center space-x-1 px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors"
            >
              <FolderOpen className="w-3 h-3 text-emerald-400" />
              <span>Import</span>
            </button>
          </div>

          {/* Database Info & Stats */}
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Tables:</span>
              <span className="font-semibold text-slate-200">{tables.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Relations:</span>
              <span className="font-semibold text-indigo-400">{relationships.length}</span>
            </div>
          </div>

          {/* Table List Tree */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1">
              Tables & Views
            </div>
            <DatabaseTree tables={tables} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 space-y-4">
          <button
            onClick={onOpenNewConnection}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
            title="Add Connection"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenImportSql}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
            title="Import SQL"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};

