import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-indigo-500 animate-spin`} />
      {message && <p className="text-xs text-slate-400 font-medium tracking-wide">{message}</p>}
    </div>
  );
};

