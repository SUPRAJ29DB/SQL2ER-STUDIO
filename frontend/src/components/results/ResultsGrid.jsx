import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Search, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { downloadText, downloadJson } from '../../utils/schemaHelpers';

export const ResultsGrid = () => {
  const { queryResult, isExecutingQuery } = useAppStore();
  const [filter, setFilter] = useState('');

  if (isExecutingQuery) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-xs text-slate-400 space-x-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
        <span>Executing query on database...</span>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-xs text-slate-500 italic">
        Execute a query to inspect tabular results here.
      </div>
    );
  }

  const columns = queryResult.columns || [];
  const rows = queryResult.rows || [];

  const filteredRows = rows.filter((row) =>
    row.some((val) => String(val).toLowerCase().includes(filter.toLowerCase()))
  );

  const exportCsv = () => {
    if (!columns.length) return;
    const header = columns.join(',');
    const body = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadText(`${header}\n${body}`, 'query_results.csv');
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1120] text-xs">
      {/* Metrics & Filter Bar */}
      <div className="h-9 px-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{rows.length} rows</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{queryResult.execution_time_ms} ms</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search results..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-6 pr-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200 focus:outline-none"
            />
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
            title="Export as CSV"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a] sticky top-0 border-b border-slate-800 z-10 font-mono text-[11px] text-slate-400">
            <tr>
              <th className="w-10 px-2 py-1.5 text-center text-slate-600 border-r border-slate-800">#</th>
              {columns.map((c, i) => (
                <th key={i} className="px-3 py-1.5 font-semibold border-r border-slate-800/60 truncate">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredRows.map((r, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-2 py-1.5 text-center text-slate-600 bg-slate-900/30 border-r border-slate-800">
                  {rIdx + 1}
                </td>
                {r.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 text-slate-200 border-r border-slate-800/30 truncate max-w-sm">
                    {cell === null ? <span className="text-slate-600 italic">null</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

