
import React, { useState, useCallback, useEffect } from 'react';
import { ProjectData, PipelineStage, PipelineResult, SavedProject } from './types';
import { generateStage1Structure, generateStage2Architecture, generateStage3Workspace } from './services/geminiService';
import { InteractiveOnboarding } from './components/InteractiveOnboarding';
import { PipelineProgress } from './components/PipelineProgress';
import { ResultViewer } from './components/ResultViewer';
import { Documentation } from './components/Documentation';
import { FAQ } from './components/FAQ';
import { SavedProjectsList } from './components/SavedProjectsList';
import { LandingPage } from './components/LandingPage';
import { Pricing } from './components/Pricing';
import { UseCases } from './components/UseCases';

const STORAGE_KEY = 'ai_prompt_studio_history_v4';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'dashboard' | 'pricing' | 'documentation' | 'faq' | 'features'>('home');
  const [currentStage, setCurrentStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [result, setResult] = useState<PipelineResult>({});
  const [currentProjectData, setCurrentProjectData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedProjects(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveProject = useCallback((project: SavedProject) => {
    setSavedProjects(prev => {
      const updated = [project, ...prev.filter(p => p.id !== project.id)].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setSavedProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const startPipeline = useCallback(async (projectData: ProjectData) => {
    setError(null);
    setResult({});
    setCurrentProjectData(projectData);
    
    try {
      setCurrentStage(PipelineStage.STRUCTURE);
      const stage1 = await generateStage1Structure(projectData);
      setResult(prev => ({ ...prev, stage1 }));

      setCurrentStage(PipelineStage.ARCHITECTURE);
      const stage2 = await generateStage2Architecture(stage1, projectData);
      setResult(prev => ({ ...prev, stage2 }));

      setCurrentStage(PipelineStage.MASTER_PROMPT);
      const stage3 = await generateStage3Workspace(projectData, stage1, stage2);
      
      const finalResult: PipelineResult = { stage1, stage2, stage3 };
      setResult(finalResult);
      setCurrentStage(PipelineStage.COMPLETED);

      saveProject({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        data: projectData,
        result: finalResult
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Pipeline error during synthesis.");
      setCurrentStage(PipelineStage.ERROR);
    }
  }, [saveProject]);

  const selectSavedProject = (project: SavedProject) => {
    setCurrentProjectData(project.data);
    setResult(project.result);
    setCurrentStage(PipelineStage.COMPLETED);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setCurrentStage(PipelineStage.IDLE);
    setResult({});
    setCurrentProjectData(null);
    setError(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToDashboard = () => {
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] glass px-6 py-4 border-b border-white/5 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
            <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">CONCEPTION STUDIO</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Blueprint Engine v4.0</p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-8">
              {[
                {id: 'home', label: 'Home'},
                {id: 'features', label: 'Features'},
                {id: 'pricing', label: 'Pricing'},
                {id: 'documentation', label: 'Docs'},
                {id: 'faq', label: 'FAQ'}
              ].map((v) => (
                <button 
                  key={v.id} 
                  onClick={() => { setView(v.id as any); setCurrentStage(PipelineStage.IDLE); }} 
                  className={`text-[11px] font-black uppercase tracking-widest transition-all relative py-2 ${view === v.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {v.label}
                  {view === v.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></span>}
                </button>
              ))}
            </div>
            <button 
              onClick={goToDashboard}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 group"
            >
              Workspace
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10">
        {view === 'home' && (
          <LandingPage onStart={goToDashboard} onNavigate={(v) => setView(v as any)} />
        )}
        
        {view === 'features' && (
          <div className="pt-32"><UseCases onBack={() => setView('home')} /></div>
        )}

        {view === 'pricing' && (
          <Pricing onBack={() => setView('home')} />
        )}

        {view === 'documentation' && (
          <div className="pt-32"><Documentation onBack={() => setView('home')} /></div>
        )}

        {view === 'faq' && (
          <div className="pt-32"><FAQ onBack={() => setView('home')} /></div>
        )}

        {view === 'dashboard' && (
          <div className="pt-32 pb-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {currentStage === PipelineStage.IDLE ? (
                <div className="space-y-24">
                   <div className="max-w-4xl mx-auto text-center py-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                      <h2 className="text-6xl font-black text-white mb-8 tracking-tighter">Your Workspace</h2>
                      <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Orchestrate complex AI-driven applications. Start from scratch or resume your existing architecture synthesis.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button 
                          onClick={() => setCurrentStage(PipelineStage.ONBOARDING)} 
                          className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30 group flex items-center gap-3"
                        >
                          New Blueprint
                          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <button 
                          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                          className="bg-white/5 text-slate-300 px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/10 border border-white/5 transition-all"
                        >
                          View History
                        </button>
                      </div>
                   </div>
                   
                   <div id="history-section" className="pt-12 border-t border-white/5">
                      <SavedProjectsList projects={savedProjects} onSelect={selectSavedProject} onDelete={deleteProject} />
                   </div>
                </div>
              ) : currentStage === PipelineStage.ONBOARDING ? (
                <div className="animate-in zoom-in-95 duration-700">
                  <InteractiveOnboarding onComplete={startPipeline} />
                </div>
              ) : (
                <div className="space-y-20">
                  <PipelineProgress currentStage={currentStage} />
                  {currentStage === PipelineStage.ERROR && (
                    <div className="text-center p-20 glass rounded-[3rem] border-rose-500/20 bg-rose-500/5">
                      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Synthesis Failed</h3>
                      <p className="text-rose-400 mb-8 max-w-md mx-auto">{error}</p>
                      <button onClick={reset} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">Back to Home</button>
                    </div>
                  )}
                  {currentStage === PipelineStage.COMPLETED && currentProjectData && (
                    <ResultViewer result={result} projectData={currentProjectData} onReset={reset} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <footer className="bg-[#010411] border-t border-white/5 py-32 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
            <div className="col-span-1 lg:col-span-2 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-white font-black text-2xl tracking-tighter uppercase">AI Conception Studio</h4>
               </div>
               <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                 Professional tools for AI-augmented software engineering. We bridge the gap between creative vision and technical implementation.
               </p>
               <div className="flex gap-5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 cursor-pointer transition-all">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    </div>
                  ))}
               </div>
            </div>
            <div>
               <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Navigation</h5>
               <ul className="space-y-6 text-sm text-slate-500 font-medium">
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setView('home')}>Home</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setView('features')}>Use Cases & Features</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setView('pricing')}>Pricing Plans</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setView('documentation')}>Documentation</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setView('faq')}>Häufige Fragen (FAQ)</li>
               </ul>
            </div>
            <div>
               <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Legal & Privacy</h5>
               <ul className="space-y-6 text-sm text-slate-500 font-medium">
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors">Datenschutz</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors">Impressum</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors">Nutzungsbedingungen</li>
                  <li className="hover:text-indigo-400 cursor-pointer transition-colors">Cookie-Einstellungen</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">© 2025 Conception Studio • Built for AI-Native Engineers</p>
            <div className="flex gap-10 text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> System Online</span>
               <span>v4.0.5-release</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
