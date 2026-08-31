'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Cpu, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import { RunTelemetry } from '@/lib/telemetry';

interface Message {
  role: 'user' | 'agent';
  content: string;
  telemetry?: RunTelemetry;
  isGuardrailBlocked?: boolean;
}

export const AgentChat: React.FC<{ datasetProfile: any; rawData: any[] }> = ({ datasetProfile, rawData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: '👋 Hello! I am your DataPilot Agent. Ask me anything about your uploaded dataset: compute sums, compare categories, detect outliers, or ask for statistical summaries!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userPrompt = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userPrompt,
          profile: datasetProfile,
          sampleRows: rawData.slice(0, 20)
        })
      });

      const resData = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: resData.reply,
          telemetry: resData.telemetry,
          isGuardrailBlocked: resData.guardrailTriggered
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          content: '⚠️ Failed to connect to analysis engine. Please verify the API route.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">DataPilot Conversational Agent</h2>
            <p className="text-[10px] text-slate-400">Statistical Analysis & Natural Language Querying</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'agent' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`rounded-2xl p-4 max-w-[85%] text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : m.isGuardrailBlocked
                  ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-bl-none'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>

              {/* Instrumentation & Telemetry Bar */}
              {m.telemetry && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-400" /> {m.telemetry.latencyMs}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-400" /> {m.telemetry.totalTokens} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> ${m.telemetry.costUSD.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-400 italic bg-slate-800/40 p-3 rounded-xl w-fit">
            <Bot className="w-4 h-4 animate-spin text-indigo-400" />
            Agent is parsing data schema & computing aggregations...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask: 'Which category has highest revenue?' or 'Average values'..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};