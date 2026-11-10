import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { AIAssistant } from './components/ai/AIAssistant';
import { ConnectionManager } from './components/database/ConnectionManager';
import { Modal } from './components/common/Modal';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { ERDesigner } from './pages/ERDesigner';
import { Settings } from './pages/Settings';
import { useAppStore } from './store/appStore';
import { useSchema } from './hooks/useSchema';
import { UploadCloud, FileCode, Check } from 'lucide-react';
import { diagramApi } from './services/diagramApi';

export const App = () => {
  const { currentPage, setCurrentPage, setStatusMessage } = useAppStore();
  const { parseSqlScript } = useSchema();

  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importText.trim()) return;
    try {
      await parseSqlScript(importText);
      setIsImportModalOpen(false);
      setImportText('');
      setCurrentPage('er-designer');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (file.name.endsWith('.db') || file.name.endsWith('.sqlite') || file.name.endsWith('.sqlite3')) {
        formData.append('file', file);
        const res = await diagramApi.uploadSQLiteDB(formData);
        if (res.success && res.data) {
          setIsImportModalOpen(false);
          setCurrentPage('er-designer');
        }
      } else {
        const text = await file.text();
        await parseSqlScript(text);
        setIsImportModalOpen(false);
        setCurrentPage('er-designer');
      }
    } catch (err) {
      setStatusMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenNewConnection={() => setIsConnModalOpen(true)}
          onOpenImportSql={() => setIsImportModalOpen(true)}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex overflow-hidden relative">
          {currentPage === 'home' && (
            <Home
              onOpenNewConnection={() => setIsConnModalOpen(true)}
              onOpenImportSql={() => setIsImportModalOpen(true)}
            />
          )}
          {currentPage === 'workspace' && <Workspace />}
          {currentPage === 'er-designer' && <ERDesigner />}
          {currentPage === 'settings' && <Settings />}
        </main>

        {/* Right AI Assistant Slide-over */}
        <AIAssistant />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Database Connection Manager Modal */}
      <ConnectionManager isOpen={isConnModalOpen} onClose={() => setIsConnModalOpen(false)} />

      {/* Import SQL / DB Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import SQL Script or SQLite DB" maxWidth="max-w-2xl">
        <div className="space-y-4 text-xs">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 text-center bg-slate-900/40 cursor-pointer transition-colors relative">
            <input
              type="file"
              accept=".sql,.ddl,.txt,.db,.sqlite,.sqlite3"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2">
              <UploadCloud className="w-8 h-8 text-indigo-400" />
              <div className="font-semibold text-slate-200">
                {isUploading ? 'Parsing file...' : 'Choose a file or drag & drop here'}
              </div>
              <div className="text-[11px] text-slate-500">Supports .sql, .ddl, and SQLite .db files</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 my-2 text-slate-500">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span>OR PASTE SQL CODE DIRECTLY</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-3">
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="CREATE TABLE customers (id SERIAL PRIMARY KEY, name VARCHAR(100)); ..."
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!importText.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30 disabled:opacity-50"
              >
                Import & Visualize
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default App;

