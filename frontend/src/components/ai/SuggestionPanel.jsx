import React, { useState, useEffect } from 'react';
import { diagramApi } from '../../services/diagramApi';
import { useAppStore } from '../../store/appStore';
import { ShieldCheck, AlertTriangle, Info, CheckCircle2, Copy, Check } from 'lucide-react';
import { Loader } from '../common/Loader';

export const SuggestionPanel = () => {
  const { schemaDefinition } = useAppStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const fetchSuggestions = async () => {
    if (!schemaDefinition?.tables?.length) return;
    setLoading(true);
    try {
      const res = await diagramApi.getSchemaSuggestions(schemaDefinition);
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
    fetchSuggestions();
  }, [schemaDefinition]);

  const copySql = (sql, index) => {
    navigator.clipboard.writeText(sql);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (loading) {
    return <Loader message="Analyzing schema health & normalization..." size="sm" />;
  }

  if (!data || !schemaDefinition?.tables?.length) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic">
        Load or import tables to run the schema quality audit.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-xs overflow-y-auto h-full">
      {/* Quality Score Header */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Schema Health Score</div>
          <div className="text-xl font-bold text-slate-100 flex items-baseline space-x-1">
            <span>{data.quality_score}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Optimization Recommendations ({data.suggestions.length})
        </div>

        {data.suggestions.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Excellent! No schema design defects or missing constraints detected.</span>
          </div>
        ) : (
          data.suggestions.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{s.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                  s.severity === 'critical'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : s.severity === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {s.severity}
                </span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">{s.description}</p>

              {s.recommended_sql && (
                <div className="relative group">
                  <pre className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {s.recommended_sql}
                  </pre>
                  <button
                    onClick={() => copySql(s.recommended_sql, idx)}
                    className="absolute right-2 top-2 p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-opacity"
                    title="Copy SQL"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

