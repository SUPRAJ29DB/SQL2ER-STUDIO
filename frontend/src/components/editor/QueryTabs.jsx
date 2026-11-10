import React from 'react';
import { Plus, X, Terminal } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';

export const QueryTabs = () => {
  const { queryTabs, activeTabId, setActiveTabId, addTab, closeTab } = useQuery();

  return (
    <div className="flex items-center bg-[#090d16] border-b border-slate-800 px-2 select-none overflow-x-auto">
      {queryTabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center space-x-2 px-3 py-1.5 border-r border-slate-800 cursor-pointer text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#0f172a] text-indigo-300 border-t-2 border-t-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[120px]">{tab.title}</span>
            {queryTabs.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={addTab}
        className="p-1.5 ml-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
        title="New Query Tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

