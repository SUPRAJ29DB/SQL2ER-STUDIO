import React, { useState, useEffect } from 'react';
import { databaseApi } from '../../services/databaseApi';
import { useAppStore } from '../../store/appStore';
import { Loader } from '../common/Loader';
import { Search, RefreshCw, Table as TableIcon } from 'lucide-react';

export const TableBrowser = ({ tableName }) => {
  const { activeConnection } = useAppStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');

  const fetchPreview = async () => {
    if (!tableName || !activeConnection) return;
    setLoading(true);
    try {
      const res = await databaseApi.getTablePreview(activeConnection.id, tableName, 50);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [tableName, activeConnection]);

  if (!tableName) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 text-xs italic">
        Select a table from the explorer to preview data.
      </div>
    );
  }

  const filteredRows = (data?.rows || []).filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-[#0b1120] border-t border-slate-800">
      {/* Table Browser Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center space-x-2">
          <TableIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">{tableName}</span>
          <span className="text-[11px] text-slate-500">({data?.row_count || 0} rows)</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Filter preview..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-6 pr-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={fetchPreview}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Refresh Table Data"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <Loader message="Fetching table rows..." size="sm" />
        ) : !data || data.columns.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No data available in this table.</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 z-10">
              <tr>
                {data.columns.map((col, idx) => (
                  <th key={idx} className="px-3 py-1.5 font-semibold text-slate-400 font-mono tracking-wider text-[11px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-slate-300 font-mono text-[11px] truncate max-w-xs">
                      {cell === null ? <span className="text-slate-600 italic">null</span> : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

