'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, BarChart3, Database, FileSpreadsheet, Sparkles, RefreshCw } from 'lucide-react';
import { analyzeDataset, DatasetProfile } from '@/lib/data_analyzer';
import { ChartRenderer } from '@/components/ChartRenderer';
import { DataPreviewTable } from '@/components/DataPreviewTable';
import { MetricsCards } from '@/components/MetricsCards';
import { AgentChat } from '@/components/AgentChat';

// Sample pre-loaded demo dataset
const SAMPLE_DEMO_CSV = `Region,Product,Units_Sold,Revenue,Customer_Satisfaction
North America,Enterprise Cloud,450,135000,4.8
Europe,Security Suite,320,96000,4.6
Asia Pacific,AI Platform,580,232000,4.9
Latin America,Data Analytics,180,45000,4.2
North America,Security Suite,290,87000,4.5
Europe,Enterprise Cloud,390,117000,4.7
Asia Pacific,Data Analytics,410,102500,4.4`;

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizations' | 'table'>('visualizations');

  const processData = (parsedRows: any[]) => {
    setData(parsedRows);
    const calculatedProfile = analyzeDataset(parsedRows);
    setProfile(calculatedProfile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data as any[]);
      }
    });
  };

  const loadDemoData = () => {
    Papa.parse(SAMPLE_DEMO_CSV, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data as any[]);
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 md:p-10">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">DataPilot AI</h1>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Vercel Live
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Autonomous Data Analysis, Dynamic Graphing & Conversational Agent
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!profile && (
            <button
              onClick={loadDemoData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Sample Dataset</span>
            </button>
          )}

          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Any CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto mt-8">
        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Metrics, Charts, & Data Table (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <MetricsCards profile={profile} />

              {/* View Switcher Tabs */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('visualizations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'visualizations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interactive Visualizations ({profile.suggestedCharts.length})
                </button>
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Spreadsheet Schema & Preview
                </button>
              </div>

              {activeTab === 'visualizations' ? (
                <div className="space-y-6">
                  {profile.suggestedCharts.map((chart, idx) => (
                    <ChartRenderer
                      key={idx}
                      type={chart.type}
                      data={data}
                      xAxis={chart.xAxis}
                      yAxis={chart.yAxis}
                      title={chart.title}
                    />
                  ))}
                </div>
              ) : (
                <DataPreviewTable data={data} columns={profile.columns} />
              )}
            </div>

            {/* Right Column: Conversational Agent Chat (5 Cols) */}
            <div className="lg:col-span-5">
              <AgentChat datasetProfile={profile} rawData={data} />
            </div>
          </div>
        ) : (
          /* Empty State Dropzone */
          <div className="border-2 border-dashed border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur max-w-2xl mx-auto my-12">
            <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-semibold text-white">No Dataset Uploaded Yet</h2>
            <p className="text-slate-400 text-xs max-w-md mt-1.5 mb-6 leading-relaxed">
              Upload any CSV spreadsheet (sales, customer records, scientific data) to automatically compute distributions, render dynamic graphs, and chat with your AI agent.
            </p>
            <div className="flex gap-3">
              <button
                onClick={loadDemoData}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Try Demo Data</span>
              </button>
              <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md">
                <UploadCloud className="w-4 h-4" />
                <span>Browse CSV File</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}