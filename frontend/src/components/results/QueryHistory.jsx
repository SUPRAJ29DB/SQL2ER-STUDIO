import React, { useEffect } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { Clock, Play, CheckCircle } from 'lucide-react';

export const QueryHistory = () => {
  const { history, fetchHistory, updateTabSql } = useQuery();

  useEffect(() => {
    fetchHistory();
  }, []);

  if (!history || history.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic">
        No execution history yet.
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 overflow-y-auto h-full text-xs">
      {history.map((item, idx) => (
        <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{item.database}</span>
            </span>
            <span>{item.execution_time_ms} ms</span>
          </div>

          <pre className="font-mono text-slate-300 text-[11px] bg-slate-950 p-2 rounded truncate overflow-hidden">
            {item.query}
          </pre>

          <button
            onClick={() => updateTabSql(item.query)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <Play className="w-2.5 h-2.5" />
            <span>Load into editor</span>
          </button>
        </div>
      ))}
    </div>
  );
};

