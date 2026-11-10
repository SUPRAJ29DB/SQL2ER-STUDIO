import React from 'react';
import { Terminal, Database, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const StatusBar = () => {
  const { statusMessage, schemaDefinition, backendHealthy } = useAppStore();

  return (
    <footer className="h-6 bg-[#090d16] border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-40">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span className="truncate max-w-md">{statusMessage}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Database className="w-3 h-3 text-slate-500" />
          <span>Dialect: <span className="text-slate-200 font-mono uppercase">{schemaDefinition?.dialect || 'Standard'}</span></span>
        </div>
        <div className="hidden sm:block text-slate-500">
          Ctrl+Enter to Execute
        </div>
      </div>
    </footer>
  );
};

