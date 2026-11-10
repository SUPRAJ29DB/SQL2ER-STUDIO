import React, { useState, useEffect } from 'react';
import { diagramApi } from '../../services/diagramApi';
import { useAppStore } from '../../store/appStore';
import { Sparkles, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Loader } from '../common/Loader';

export const RelationshipExplainer = ({ relationship }) => {
  const { schemaDefinition } = useAppStore();
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!relationship) return;

    const explain = async () => {
      setLoading(true);
      try {
        const payload = {
          id: relationship.id,
          source_table: relationship.source,
          source_column: relationship.data?.sourceColumn || 'id',
          target_table: relationship.target,
          target_column: relationship.data?.targetColumn || 'id',
          cardinality: relationship.data?.cardinality || '1:N',
          on_delete: relationship.data?.onDelete || 'NO ACTION',
          on_update: relationship.data?.onUpdate || 'NO ACTION',
        };
        const res = await diagramApi.explainRelationship(payload, schemaDefinition);
        if (res.success && res.data) {
          setExplanation(res.data);
        }
      } catch (err) {
        setExplanation(`Failed to generate explanation: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    explain();
  }, [relationship]);

  if (!relationship) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic">
        Click any relationship edge on the canvas to inspect its meaning.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-xs">
      {/* Edge Context Card */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
            <span>{relationship.source}</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>{relationship.target}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30 font-bold">
            {relationship.data?.cardinality || '1:N'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {relationship.data?.sourceColumn} &rarr; {relationship.data?.targetColumn}
        </div>
      </div>

      {/* AI Explanation Content */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-indigo-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Architectural Explanation</span>
        </div>

        {loading ? (
          <Loader message="Synthesizing explanation..." size="sm" />
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line text-xs font-sans">
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

