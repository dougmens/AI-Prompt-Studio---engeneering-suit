import React, { useState, useRef } from 'react';
import { PipelineResult, WorkspaceFile, ProjectData } from '../types';
import { Button } from './Button';
import { RefinementDrawer } from './RefinementDrawer';
import { TerminalEmulator } from './TerminalEmulator';
import { LabTools } from './LabTools';
import { ArchitectChat } from './ArchitectChat';
// Corrected imports: decodeAudio and decodeAudioData are located in audioUtils.ts, not geminiService.ts
import { speakText } from '../services/geminiService';
import { decodeAudio, decodeAudioData } from '../services/audioUtils';

interface ResultViewerProps {
  result: PipelineResult;
  projectData: ProjectData;
  onReset: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ result, projectData, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'strategy' | 'files' | 'terminal' | 'tech' | 'api' | 'lab' | 'chat'>('prompt');
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(result.stage3?.workspaceFiles[0] || null);
  const [refinementTarget, setRefinementTarget] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTTS = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const b64 = await speakText(text.slice(0, 1500)); // Limit for TTS chunking safety
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decodeAudio(b64), audioCtxRef.current, 24000, 1);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'POST': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <RefinementDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} target={refinementTarget} projectData={projectData} />

      <div className="glass p-10 rounded-[3rem] flex flex-col lg:flex-row justify-between items-center gap-8 border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>
        <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-1">{projectData.title} <span className="text-slate-600 font-light">Spezifikation</span></h2>
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">Status: Ready for Production & Scaling</p>
            </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onReset}>Neu starten</Button>
          <Button onClick={() => copyText(result.stage3?.masterPrompt || '')} className="px-8 py-4 shadow-indigo-500/30">
            {copied ? 'Kopiert!' : 'Master Prompt kopieren'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex p-1.5 bg-slate-900/80 rounded-[1.75rem] border border-white/5 max-w-full overflow-x-auto scrollbar-hide backdrop-blur-xl">
          {[
            { id: 'strategy', label: 'Strategy' },
            { id: 'prompt', label: 'Master Prompt' },
            { id: 'files', label: 'Workspace Files' },
            { id: 'tech', label: 'Architecture' },
            { id: 'api', label: 'API Schema' },
            { id: 'terminal', label: 'CLI' },
            { id: 'lab', label: 'Creative Lab 🧪' },
            { id: 'chat', label: 'AI Architect 🤖' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/10 min-h-[700px] flex flex-col bg-slate-950/20 relative">
          {activeTab === 'lab' ? (
             <div className="p-12"><LabTools /></div>
          ) : activeTab === 'chat' ? (
             <div className="p-12"><ArchitectChat /></div>
          ) : (
            <>
              {activeTab === 'strategy' && projectData.marketingStrategy && (
                <div className="p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full animate-in fade-in duration-500">
                  <div className="lg:col-span-8 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-white tracking-tight">Positionierung & Skalierung</h3>
                        <Button variant="ghost" size="sm" onClick={() => handleTTS(projectData.marketingStrategy!.usp)} isLoading={isSpeaking} className="gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                          Vorlesen
                        </Button>
                      </div>
                      <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] relative">
                        <p className="text-xl text-indigo-100 font-bold leading-relaxed">{projectData.marketingStrategy.usp}</p>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-indigo-500/10">
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compliance</span>
                              <p className="text-slate-300 text-xs font-bold">{projectData.complianceLevel || 'DSGVO Standard'}</p>
                           </div>
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Monitoring</span>
                              <p className="text-slate-300 text-xs font-bold">{projectData.analyticsTool || 'PostHog'}</p>
                           </div>
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">i18n</span>
                              <p className="text-slate-300 text-xs font-bold">{projectData.i18nRequired ? 'Multi-Language' : 'Single'}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Revenue Stärken</span>
                        <ul className="space-y-2">
                          {projectData.marketingStrategy.monetizationSuggestions?.map((s, i) => <li key={i} className="text-xs text-slate-300 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">• {s}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Growth Opportunities</span>
                        <ul className="space-y-2">
                          {projectData.marketingStrategy.swot.opportunities.map((s, i) => <li key={i} className="text-xs text-slate-300 bg-indigo-500/5 p-4 rounded-2xl border border-emerald-500/10">• {s}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-4 space-y-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Infrastructure Pillar</h4>
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl border bg-slate-950/40 border-indigo-500/20">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">DevOps Pipeline</span>
                        <p className="text-xs text-white font-bold">{projectData.ciCdPreference || 'Vercel Auto-Deploy'}</p>
                      </div>
                      <div className="p-4 rounded-2xl border bg-slate-950/40 border-emerald-500/20">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Privacy Tier</span>
                        <p className="text-xs text-white font-bold">{projectData.complianceLevel}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Primary Pain Points</span>
                        <div className="flex flex-wrap gap-2">
                          {projectData.marketingStrategy.targetAudiencePainPoints.map((p, i) => <span key={i} className="px-3 py-1.5 bg-slate-950 border border-white/5 rounded-xl text-[10px] text-slate-400">{p}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prompt' && (
                <div className="relative group flex-1 flex flex-col">
                   <div className="absolute top-6 right-6 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleTTS(result.stage3?.masterPrompt || '')} isLoading={isSpeaking}>Listen</Button>
                      <Button variant="ghost" size="sm" onClick={() => copyText(result.stage3?.masterPrompt || '')}>Copy</Button>
                   </div>
                   <div className="p-12 mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap flex-1 hover:text-white transition-colors cursor-text selection:bg-indigo-500/30 overflow-auto">
                     {result.stage3?.masterPrompt}
                   </div>
                </div>
              )}

              {activeTab === 'tech' && (
                <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Tech Stack & Infrastructure</h4>
                    <div className="space-y-4">
                      {result.stage2?.techStack.frontend.map((t, i) => (
                        <div key={i} className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                          <div className="font-bold text-white mb-2">{t.name}</div>
                          <div className="text-[10px] text-slate-500 leading-relaxed">{t.justification}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Ops & Security Architecture</h4>
                    <div className="space-y-4">
                       <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                          <div className="text-indigo-400 font-bold mb-2">Production Guardrails</div>
                          <p className="text-[10px] text-slate-500">Konfiguration für {projectData.complianceLevel}, Monitoring via {projectData.analyticsTool} und Deployment-Automatisierung via {projectData.ciCdPreference}.</p>
                       </div>
                      {result.stage2?.techStack.backend.map((t, i) => (
                        <div key={i} className="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                          <div className="font-bold text-white mb-2">{t.name}</div>
                          <div className="text-[10px] text-slate-500 leading-relaxed">{t.justification}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="p-12 space-y-6 w-full">
                  {result.stage2?.apiEndpoints.map((api, idx) => (
                    <div key={idx} className="bg-slate-900/20 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-indigo-500/30 transition-all">
                      <div className="px-8 py-5 bg-slate-900/40 flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getMethodColor(api.method)}`}>{api.method}</span>
                        <code className="text-sm text-indigo-400 font-mono">{api.path}</code>
                      </div>
                      <div className="p-8 space-y-4">
                        <p className="text-sm text-slate-300 font-medium">{api.description}</p>
                        <div className="bg-slate-950/40 p-4 rounded-xl">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Response Structure</span>
                          <code className="text-[11px] text-emerald-400 font-mono">{api.response}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'terminal' && <TerminalEmulator result={result} projectData={projectData} onOpenRefinement={(t) => { setRefinementTarget(t); setIsDrawerOpen(true); }} />}
              
              {activeTab === 'files' && (
                <div className="flex flex-col lg:flex-row h-full flex-1">
                   <div className="w-full lg:w-80 border-r border-white/5 bg-slate-950/20 p-8 space-y-3">
                     <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Generated Workspace</h4>
                     {result.stage3?.workspaceFiles.map((file, i) => (
                        <button key={i} onClick={() => setSelectedFile(file)} className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-4 ${selectedFile?.name === file.name ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {file.name}
                        </button>
                     ))}
                   </div>
                   <div className="flex-1 flex flex-col p-12 bg-slate-950/40">
                      {selectedFile && (
                        <div className="space-y-8 h-full flex flex-col">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h4 className="text-lg font-bold text-white">{selectedFile.name}</h4>
                                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{selectedFile.description}</p>
                              </div>
                              <div className="flex gap-2">
                                 <Button variant="ghost" size="sm" onClick={() => handleTTS(selectedFile.content)} isLoading={isSpeaking}>Listen</Button>
                                 <Button variant="ghost" size="sm" onClick={() => copyText(selectedFile.content)}>Kopieren</Button>
                              </div>
                           </div>
                           <div className="flex-1 bg-slate-900/60 rounded-[2rem] p-8 mono text-xs text-indigo-300/80 overflow-auto border border-white/5 selection:bg-indigo-500/30 leading-relaxed">
                              {selectedFile.content}
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
