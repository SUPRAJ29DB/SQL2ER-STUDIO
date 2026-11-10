import React, { useState } from 'react';
import { Database, Plus, RefreshCw } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { DatabaseTree } from './DatabaseTree';
import { TableBrowser } from './TableBrowser';
import { ConnectionManager } from './ConnectionManager';
import { useAppStore } from '../../store/appStore';

export const DatabaseExplorer = () => {
  const { connections, activeConnection, setActiveConnection } = useDatabase();
  const { schemaDefinition, selectedTable } = useAppStore();
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#0b1120] border-r border-slate-800">
      {/* Header & Connection Selector */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connection</span>
          </span>
          <button
            onClick={() => setIsConnModalOpen(true)}
            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
            title="New Connection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <select
          value={activeConnection?.id || ''}
          onChange={(e) => {
            const found = connections.find((c) => c.id === e.target.value);
            setActiveConnection(found || null);
          }}
          className="w-full px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">(Local / Memory / Imported)</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.db_type})
            </option>
          ))}
        </select>
      </div>

      {/* Database Schema Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <DatabaseTree tables={schemaDefinition?.tables || []} />
      </div>

      {/* Selected Table Preview */}
      {selectedTable && (
        <div className="h-64">
          <TableBrowser tableName={selectedTable.name} />
        </div>
      )}

      {/* Connection Manager Modal */}
      <ConnectionManager isOpen={isConnModalOpen} onClose={() => setIsConnModalOpen(false)} />
    </div>
  );
};

