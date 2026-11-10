import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, LayoutTemplate, Download, FileCode, RefreshCw } from 'lucide-react';
import { downloadJson, downloadText } from '../../utils/schemaHelpers';
import { useSchema } from '../../hooks/useSchema';
import { useAppStore } from '../../store/appStore';

export const DiagramToolbar = ({ zoom, setZoom, onResetView, onAutoLayout }) => {
  const { diagramLayout, schemaDefinition } = useAppStore();
  const { generateSql } = useSchema();

  const handleExportJson = () => {
    downloadJson(diagramLayout, `${schemaDefinition.database_name || 'schema'}_diagram.json`);
  };

  const handleExportSql = async () => {
    try {
      const sql = await generateSql(schemaDefinition?.dialect || 'postgresql');
      downloadText(sql, `${schemaDefinition.database_name || 'schema'}_ddl.sql`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/80 shadow-xl select-none">
      {/* Zoom Controls */}
      <button
        onClick={() => setZoom((z) => Math.min(z + 0.1, 2.0))}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
      <button
        onClick={() => setZoom((z) => Math.max(z - 0.1, 0.4))}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-700 mx-1"></div>

      {/* Fit View */}
      <button
        onClick={onResetView}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Fit View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Auto-Layout */}
      <button
        onClick={onAutoLayout}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Auto-organize table layout"
      >
        <LayoutTemplate className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-700 mx-1"></div>

      {/* Export Options */}
      <button
        onClick={handleExportSql}
        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors"
        title="Generate & Download SQL DDL"
      >
        <FileCode className="w-3.5 h-3.5" />
        <span>Export SQL</span>
      </button>

      <button
        onClick={handleExportJson}
        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        title="Export Diagram JSON"
      >
        <Download className="w-3.5 h-3.5" />
        <span>JSON</span>
      </button>
    </div>
  );
};

