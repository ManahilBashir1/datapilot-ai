'use client';

import React from 'react';
import { Database, Columns, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { DatasetProfile } from '@/lib/data_analyzer';

export const MetricsCards: React.FC<{ profile: DatasetProfile }> = ({ profile }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Database className="w-4 h-4 text-indigo-400" /> Total Records
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{profile.rowCount.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Columns className="w-4 h-4 text-sky-400" /> Attributes (Cols)
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{profile.columnCount}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Numeric Metrics
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {profile.columns.filter(c => c.type === 'numeric').length}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Guardrails
          </div>
          <div className="text-base font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Shield
          </div>
        </div>
      </div>

      {profile.quickInsights.length > 0 && (
        <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-200/90 space-y-1">
            <span className="font-semibold text-indigo-200">Autonomous Profile Insights:</span>
            {profile.quickInsights.map((insight, idx) => (
              <div key={idx} className="text-slate-300">• {insight}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};