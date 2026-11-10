/**
 * Helper utilities for Schema and Diagram rendering
 */

export const getDataTypeCategory = (type = '') => {
  const t = type.toUpperCase();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('DECIMAL') || t.includes('NUMERIC') || t.includes('FLOAT') || t.includes('DOUBLE')) {
    return 'number';
  }
  if (t.includes('CHAR') || t.includes('TEXT') || t.includes('STRING')) {
    return 'string';
  }
  if (t.includes('DATE') || t.includes('TIME')) {
    return 'date';
  }
  if (t.includes('BOOL')) {
    return 'boolean';
  }
  if (t.includes('JSON')) {
    return 'json';
  }
  return 'other';
};

export const getDataTypeBadgeClass = (category) => {
  switch (category) {
    case 'number':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'string':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'date':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'boolean':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'json':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export const downloadJson = (data, filename = 'schema.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadText = (text, filename = 'export.sql') => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

