import React from 'react';
import { Play, Sparkles, LayoutGrid, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useSchema } from '../../hooks/useSchema';
import { useAppStore } from '../../store/appStore';
import { downloadText } from '../../utils/schemaHelpers';

export const QueryToolbar = () => {
  const { activeTab, updateTabSql, executeCurrentQuery, isExecutingQuery } = useQuery();
  const { parseSqlScript, loading: parsingLoading } = useSchema();
  const { schemaDefinition, setSchemaDefinition, setCurrentPage } = useAppStore();

  const handleParseToDiagram = async () => {
    if (!activeTab?.sql) return;
    try {
      await parseSqlScript(activeTab.sql, schemaDefinition?.dialect || 'standard');
      setCurrentPage('er-designer');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportSql = () => {
    if (activeTab?.sql) {
      downloadText(activeTab.sql, `${activeTab.title || 'query'}.sql`);
    }
  };

  return (
    <div className="h-10 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between select-none">
      <div className="flex items-center space-x-2">
        {/* Run Query */}
        <button
          onClick={executeCurrentQuery}
          disabled={isExecutingQuery}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          {isExecutingQuery ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Execute</span>
        </button>

        {/* Parse to ER Diagram */}
        <button
          onClick={handleParseToDiagram}
          disabled={parsingLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
          title="Parse SQL DDL and render in ER Diagram Designer"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Generate ER Diagram</span>
        </button>

        {/* Dialect Selector */}
        <select
          value={schemaDefinition?.dialect || 'postgresql'}
          onChange={(e) => setSchemaDefinition((prev) => ({ ...prev, dialect: e.target.value }))}
          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono focus:outline-none"
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="sqlite">SQLite</option>
        </select>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={handleExportSql}
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center space-x-1"
          title="Export SQL"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={() => updateTabSql('')}
          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          title="Clear Editor"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

