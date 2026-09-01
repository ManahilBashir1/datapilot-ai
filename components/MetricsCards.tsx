'use client';

import React from 'react';

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'date';
  nullCount?: number;
  uniqueCount?: number;
  mean?: number;
  min?: number;
  max?: number;
  sum?: number;
}

export interface DatasetProfile {
  rowCount: number;
  columnCount: number;
  columns: ColumnInfo[];
  suggestedCharts?: any[];
  quickInsights?: string[];
}

export const MetricsCards: React.FC<{ profile: DatasetProfile }> = ({ profile }) => {
  const numericCount = (profile.columns || []).filter((c: ColumnInfo) => c.type === 'numeric').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="text-indigo-400">📊</span>
            Total Records
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {profile.rowCount ? profile.rowCount.toLocaleString() : 0}
          </div>
        </div>

        {/* Card 2: Attributes */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="text-sky-400">📋</span>
            Attributes (Cols)
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {profile.columnCount || 0}
          </div>
        </div>

        {/* Card 3: Numeric Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="text-emerald-400">📈</span>
            Numeric Metrics
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {numericCount}
          </div>
        </div>

        {/* Card 4: Guardrails Status */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="text-emerald-400">🛡️</span>
            Guardrails
          </div>
          <div className="text-base font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Shield
          </div>
        </div>
      </div>

      {/* Autonomous Insights Banner */}
      {profile.quickInsights && profile.quickInsights.length > 0 && (
        <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
          <span className="text-indigo-400 shrink-0 mt-0.5">✨</span>
          <div className="text-xs text-indigo-200/90 space-y-1">
            <span className="font-semibold text-indigo-200">Autonomous Profile Insights:</span>
            {profile.quickInsights.map((insight: string, idx: number) => (
              <div key={idx} className="text-slate-300">• {insight}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};