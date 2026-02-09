
import React, { useState } from 'react';
import { PipelineResult } from '../types';
import { Button } from './Button';

interface ResultViewerProps {
  result: PipelineResult;
  onReset: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!result.stage3) return;
    navigator.clipboard.writeText(result.stage3);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!result.stage3) return;
    const blob = new Blob([result.stage3], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_Prompt_${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Dynamic Results Header */}
      <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border-indigo-500/20 shadow-2xl">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Kompilierung vollständig.</h2>
                <p className="text-slate-400 font-medium">Ihre Architektur ist bereit zur Implementierung.</p>
            </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="ghost" onClick={onReset} className="flex-1 md:flex-none">Neu starten</Button>
          <Button variant="outline" onClick={downloadMarkdown} className="flex-1 md:flex-none">Download .md</Button>
          <Button onClick={copyToClipboard} className="flex-1 md:flex-none min-w-[140px]">
            {copied ? 'Kopiert!' : 'Alles kopieren'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar: Metadata & Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-3xl space-y-8">
            <div>
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    System-Modell
                </h3>
                <div className="space-y-4">
                  {result.stage1?.entities.map((e, idx) => (
                    <div key={idx} className="group p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                      <div className="text-white font-bold text-sm mb-1">{e.name}</div>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{e.description}</p>
                    </div>
                  ))}
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    Tech-Manifest
                </h3>
                <div className="grid grid-cols-1 gap-3 font-mono text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                        <span className="text-slate-500">Frontend:</span>
                        <span className="text-slate-200">{result.stage2?.techStack.frontend}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                        <span className="text-slate-500">Backend:</span>
                        <span className="text-slate-200">{result.stage2?.techStack.backend}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                        <span className="text-slate-500">Database:</span>
                        <span className="text-slate-200">{result.stage2?.techStack.database}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/20 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] text-indigo-300 font-medium leading-normal italic">
                    Dieser Prompt wurde von der Gemini 3 Pro Engine für maximale Agenten-Kohärenz optimiert.
                </p>
            </div>
          </div>
        </div>

        {/* Main: Prompt Editor View */}
        <div className="lg:col-span-8 group">
          <div className="relative glass rounded-3xl overflow-hidden shadow-2xl border-white/10 group-hover:border-indigo-500/20 transition-all">
            <div className="bg-slate-900/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">master_prompt.md</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md">MARKDOWN</span>
                </div>
            </div>
            <div className="p-8 h-[700px] overflow-auto mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-indigo-500/30 scroll-smooth">
              {result.stage3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
