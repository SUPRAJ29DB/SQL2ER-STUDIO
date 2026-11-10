import React from 'react';
import { Key, Link2, Table, Hash, Type } from 'lucide-react';
import { getDataTypeCategory, getDataTypeBadgeClass } from '../../utils/schemaHelpers';

export const TableNode = ({ node, isSelected, onClick, onMouseDown }) => {
  const table = node.data?.table || { name: node.id, columns: [] };
  const columns = table.columns || [];

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      className={`absolute w-72 rounded-xl bg-[#0f172a] shadow-2xl border transition-shadow cursor-move select-none ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Table Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 rounded-t-xl border-b border-slate-800">
        <div className="flex items-center space-x-2 truncate">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Table className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-100 text-xs truncate">{table.name}</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {columns.length} cols
        </span>
      </div>

      {/* Columns List */}
      <div className="divide-y divide-slate-800/40 max-h-80 overflow-y-auto">
        {columns.map((col) => {
          const category = getDataTypeCategory(col.data_type);
          const badgeClass = getDataTypeBadgeClass(category);

          return (
            <div
              key={col.name}
              className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-800/30 transition-colors text-[11px]"
            >
              {/* Left Key Indicator & Name */}
              <div className="flex items-center space-x-2 truncate">
                {col.is_primary_key ? (
                  <Key className="w-3 h-3 text-amber-400 shrink-0" title="Primary Key" />
                ) : col.is_foreign_key ? (
                  <Link2 className="w-3 h-3 text-cyan-400 shrink-0" title={`References ${col.references_table || 'table'}`} />
                ) : (
                  <span className="w-3 h-3 text-slate-600 flex items-center justify-center text-[10px]">&bull;</span>
                )}
                <span className={`truncate font-medium ${col.is_primary_key ? 'text-amber-200' : 'text-slate-200'}`}>
                  {col.name}
                </span>
                {!col.is_nullable && !col.is_primary_key && (
                  <span className="text-[9px] text-rose-400 font-bold" title="NOT NULL">*</span>
                )}
              </div>

              {/* Data Type Badge */}
              <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] border ${badgeClass} truncate max-w-[100px]`}>
                {col.data_type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

