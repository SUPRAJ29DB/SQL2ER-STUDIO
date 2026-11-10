import React, { useState } from 'react';
import { QueryTabs } from '../components/editor/QueryTabs';
import { QueryToolbar } from '../components/editor/QueryToolbar';
import { SQLCodeEditor } from '../components/editor/SQLCodeEditor';
import { ResultsGrid } from '../components/results/ResultsGrid';
import { QueryHistory } from '../components/results/QueryHistory';
import { Table, History } from 'lucide-react';

export const Workspace = () => {
  const [bottomTab, setBottomTab] = useState('results'); // results, history

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090d16] overflow-hidden">
      {/* Top Half: Tabs, Toolbar & SQL Editor */}
      <div className="flex flex-col h-3/5 border-b border-slate-800">
        <QueryTabs />
        <QueryToolbar />
        <SQLCodeEditor />
      </div>

      {/* Bottom Half: Results Grid & Execution Logs */}
      <div className="flex flex-col h-2/5 bg-[#0b1120]">
        <div className="h-8 bg-[#090d16] border-b border-slate-800 flex items-center px-3 space-x-2 select-none">
          <button
            onClick={() => setBottomTab('results')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              bottomTab === 'results'
                ? 'bg-slate-800 text-indigo-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Query Results</span>
          </button>
          <button
            onClick={() => setBottomTab('history')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              bottomTab === 'history'
                ? 'bg-slate-800 text-indigo-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {bottomTab === 'results' ? <ResultsGrid /> : <QueryHistory />}
        </div>
      </div>
    </div>
  );
};

