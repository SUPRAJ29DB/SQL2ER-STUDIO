import React, { useState } from 'react';
import { Table, Key, Link2, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const DatabaseTree = ({ tables = [] }) => {
  const { selectedTable, setSelectedTable } = useAppStore();
  const [expandedTables, setExpandedTables] = useState({});

  const toggleTable = (tableName) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  if (!tables.length) {
    return (
      <div className="p-3 text-center text-xs text-slate-500 italic">
        No tables loaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {tables.map((tbl) => {
        const isExpanded = !!expandedTables[tbl.name];
        const isSelected = selectedTable?.name === tbl.name;

        return (
          <div key={tbl.name} className="select-none">
            {/* Table Row */}
            <div
              className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs ${
                isSelected
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              onClick={() => setSelectedTable(tbl)}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTable(tbl.name);
                  }}
                  className="p-0.5 text-slate-500 hover:text-slate-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                <Table className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium truncate">{tbl.name}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {tbl.columns?.length || 0}
              </span>
            </div>

            {/* Columns Subtree */}
            {isExpanded && (
              <div className="ml-5 pl-2 border-l border-slate-800 space-y-0.5 py-1">
                {tbl.columns?.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between py-1 px-1.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      {col.is_primary_key ? (
                        <Key className="w-3 h-3 text-amber-400 shrink-0" title="Primary Key" />
                      ) : col.is_foreign_key ? (
                        <Link2 className="w-3 h-3 text-indigo-400 shrink-0" title="Foreign Key" />
                      ) : (
                        <span className="w-3 h-3 shrink-0 flex items-center justify-center text-slate-600 text-[9px]">•</span>
                      )}
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">{col.data_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

