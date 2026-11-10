import React, { useState } from 'react';
import { Sliders, Sparkles, Database, CheckCircle, Shield } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const Settings = () => {
  const { schemaDefinition, setSchemaDefinition } = useAppStore();

  const [aiSettings, setAiSettings] = useState({
    provider: 'offline',
    openaiKey: '',
    geminiKey: '',
    ollamaUrl: 'http://localhost:11434',
    model: 'gpt-4o-mini',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-8 select-none text-xs">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-slate-400">Configure AI provider integrations, default SQL dialects, and display preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Configuration Section */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Provider Configuration</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1">Active AI Provider</label>
              <select
                value={aiSettings.provider}
                onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="offline">Offline / Local Heuristic Rules (Zero API Keys Required)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Flash / Pro)</option>
                <option value="ollama">Ollama Local Instance (LLaMA 3 / Mistral)</option>
              </select>
            </div>

            {aiSettings.provider === 'openai' && (
              <div>
                <label className="block font-medium text-slate-400 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={aiSettings.openaiKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, openaiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {aiSettings.provider === 'gemini' && (
              <div>
                <label className="block font-medium text-slate-400 mb-1">Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIza..."
                  value={aiSettings.geminiKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, geminiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {aiSettings.provider === 'ollama' && (
              <div>
                <label className="block font-medium text-slate-400 mb-1">Ollama Base URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={aiSettings.ollamaUrl}
                  onChange={(e) => setAiSettings({ ...aiSettings, ollamaUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Database & Dialect Defaults */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>SQL Dialect Defaults</span>
          </div>

          <div>
            <label className="block font-medium text-slate-400 mb-1">Default Dialect for DDL Generation</label>
            <select
              value={schemaDefinition?.dialect || 'postgresql'}
              onChange={(e) => setSchemaDefinition((prev) => ({ ...prev, dialect: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="postgresql">PostgreSQL (Standard ANSI + Constraints)</option>
              <option value="mysql">MySQL 8.0+ / MariaDB</option>
              <option value="sqlite">SQLite 3</option>
            </select>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

