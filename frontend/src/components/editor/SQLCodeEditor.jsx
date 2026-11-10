import React, { useRef } from 'react';
import { useQuery } from '../../hooks/useQuery';

export const SQLCodeEditor = () => {
  const { activeTab, updateTabSql, executeCurrentQuery } = useQuery();
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter executes query
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeCurrentQuery();
    }
    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      updateTabSql(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const lineCount = (activeTab?.sql || '').split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex bg-[#090d16] overflow-hidden font-mono text-xs">
      {/* Line Numbers */}
      <div className="w-12 py-3 bg-[#080c14] border-r border-slate-800/80 text-right pr-3 select-none text-slate-600 space-y-1">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-5 h-5">{num}</div>
        ))}
      </div>

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        value={activeTab?.sql || ''}
        onChange={(e) => updateTabSql(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="-- Enter SQL statements here... e.g. CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));"
        className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-5 h-full overflow-auto selection:bg-indigo-600/30"
        spellCheck="false"
      />
    </div>
  );
};

