import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';
import { Modal } from '../common/Modal';

export const ConnectionManager = ({ isOpen, onClose }) => {
  const { connections, createConnection, testConnection, removeConnection } = useDatabase();

  const [formData, setFormData] = useState({
    name: 'Local PostgreSQL',
    db_type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '',
    file_path: '',
  });

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection(formData);
      setTestResult({ success: ok, message: ok ? 'Connection successful!' : 'Connection failed. Check host and credentials.' });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createConnection(formData);
      onClose();
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Database Connection Manager" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Existing Connections */}
        {connections.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Saved Connections</h4>
            <div className="space-y-2">
              {connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-medium text-slate-200">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.db_type} &bull; {c.database}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeConnection(c.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form to Add New Connection */}
        <form onSubmit={handleSave} className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Connection</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Connection Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Database Type</label>
              <select
                value={formData.db_type}
                onChange={(e) => setFormData({ ...formData, db_type: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite (File)</option>
              </select>
            </div>
          </div>

          {formData.db_type === 'sqlite' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SQLite DB File Path</label>
              <input
                type="text"
                placeholder="./database/sample.db"
                value={formData.file_path}
                onChange={(e) => setFormData({ ...formData, file_path: e.target.value, database: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Host</label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Database Name</label>
                <input
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 border ${
              testResult.success
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30"
              >
                {saving ? 'Saving...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

