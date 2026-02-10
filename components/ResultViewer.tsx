
import React, { useState } from 'react';
import { PipelineResult, WorkspaceFile, ProjectData } from '../types';
import { Button } from './Button';
import { RefinementDrawer } from './RefinementDrawer';
import { TerminalEmulator } from './TerminalEmulator';

interface ResultViewerProps {
  result: PipelineResult;
  projectData: ProjectData;
  onReset: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ result, projectData, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'files' | 'terminal' | 'tech' | 'guardrails' | 'api'>('prompt');
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(result.stage3?.workspaceFiles[0] || null);
  const [refinementTarget, setRefinementTarget] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectorInput, setSelectorInput] = useState('');

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openRefinement = (target: string) => {
    setRefinementTarget(target);
    setIsDrawerOpen(true);
  };

  const handleSelectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectorInput.trim()) {
      openRefinement(`CSS Selector: ${selectorInput}`);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'POST': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'PUT': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'DELETE': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <RefinementDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        target={refinementTarget} 
        projectData={projectData} 
      />

      <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border-indigo-500/20 shadow-2xl">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Setup abgeschlossen.</h2>
                <p className="text-slate-400 font-medium italic">Klicke auf Komponenten für Refinement oder nutze die CLI.</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSelectorSubmit} className="relative group">
            <input 
              type="text" 
              placeholder="Selector (z.B. .btn-primary)" 
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all pr-10 min-w-[200px]"
              value={selectorInput}
              onChange={(e) => setSelectorInput(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1.5 p-1 text-slate-500 hover:text-indigo-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onReset}>Neu starten</Button>
            <Button onClick={() => copyText(result.stage3?.masterPrompt || '')} className="min-w-[140px]" size="sm">
              {copied ? 'Kopiert!' : 'Master Prompt'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 max-w-fit overflow-x-auto scrollbar-hide">
            {[
              { id: 'prompt', label: 'Master Prompt' },
              { id: 'files', label: 'Workspace Files' },
              { id: 'terminal', label: 'Agent CLI' },
              { id: 'tech', label: 'Tech Stack' },
              { id: 'guardrails', label: 'Guardrails' },
              { id: 'api', label: 'API Doku' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative glass rounded-3xl overflow-hidden shadow-2xl border-white/10 min-h-[600px] flex flex-col md:flex-row">
            {activeTab === 'terminal' && (
              <TerminalEmulator result={result} projectData={projectData} onOpenRefinement={openRefinement} />
            )}

            {activeTab === 'prompt' && (
              <div className="p-8 mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap flex-1 cursor-help hover:text-white transition-colors" onClick={() => openRefinement('Master Prompt Structure')}>
                {result.stage3?.masterPrompt}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="flex flex-col md:flex-row w-full h-full min-h-[600px]">
                <div className="w-full md:w-64 border-r border-white/5 bg-slate-950/30 p-4 space-y-2 overflow-y-auto">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Explorer</h4>
                  {result.stage3?.workspaceFiles.map((file, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition-all flex items-center gap-3 ${selectedFile?.name === file.name ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      {file.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex flex-col">
                  {selectedFile && (
                    <>
                      <div className="px-8 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-white block">{selectedFile.name}</span>
                          <span className="text-[10px] text-slate-500">{selectedFile.description}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openRefinement(`File: ${selectedFile.name}`)}>Analysieren</Button>
                          <Button variant="ghost" size="sm" onClick={() => copyText(selectedFile.content)}>Kopieren</Button>
                        </div>
                      </div>
                      <div className="p-8 mono text-xs leading-relaxed text-indigo-300/80 whitespace-pre overflow-auto flex-1 bg-slate-950/20">
                        {selectedFile.content}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'guardrails' && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {['security', 'performance', 'reliability'].map((cat) => (
                  <div key={cat} className="space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{cat}</h4>
                    {result.stage2?.guardrails[cat as keyof typeof result.stage2.guardrails].map((item: string, i: number) => (
                      <div 
                        key={i} 
                        className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-xs text-slate-300 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
                        onClick={() => openRefinement(`Guardrail: ${item}`)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tech' && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Frontend</h4>
                  {result.stage2?.techStack.frontend.map((t, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                      onClick={() => openRefinement(`Tech: ${t.name}`)}
                    >
                      <div className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{t.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{t.justification}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Backend</h4>
                  {result.stage2?.techStack.backend.map((t, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                      onClick={() => openRefinement(`Tech: ${t.name}`)}
                    >
                      <div className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{t.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{t.justification}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="p-8 space-y-6 w-full">
                {result.stage2?.apiEndpoints.map((api, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all group"
                    onClick={() => openRefinement(`Endpoint: ${api.method} ${api.path}`)}
                  >
                    <div className="px-6 py-4 bg-slate-900/50 flex items-center gap-4 group-hover:bg-indigo-500/5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(api.method)}`}>{api.method}</span>
                      <code className="text-xs text-indigo-300">{api.path}</code>
                    </div>
                    <div className="p-6 text-xs text-slate-400">{api.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
