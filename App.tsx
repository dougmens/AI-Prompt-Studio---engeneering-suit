
import React, { useState, useCallback, useEffect } from 'react';
import { ProjectData, PipelineStage, PipelineResult, SavedProject } from './types';
import { generateStage1Structure, generateStage2Architecture, generateStage3Workspace } from './services/geminiService';
import { InteractiveOnboarding } from './components/InteractiveOnboarding';
import { PipelineProgress } from './components/PipelineProgress';
import { ResultViewer } from './components/ResultViewer';
import { Documentation } from './components/Documentation';
import { FAQ } from './components/FAQ';
import { SavedProjectsList } from './components/SavedProjectsList';

const STORAGE_KEY = 'ai_prompt_studio_history';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'documentation' | 'faq'>('dashboard');
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
      setError(err.message || "Pipeline-Fehler.");
      setCurrentStage(PipelineStage.ERROR);
    }
  }, [saveProject]);

  const selectSavedProject = (project: SavedProject) => {
    setCurrentProjectData(project.data);
    setResult(project.result);
    setCurrentStage(PipelineStage.COMPLETED);
    setView('dashboard');
  };

  const reset = () => {
    setCurrentStage(PipelineStage.IDLE);
    setResult({});
    setCurrentProjectData(null);
    setError(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[100] glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
            <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">Prompt Studio</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Agent Protocol v3</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {['dashboard', 'documentation', 'faq'].map((v) => (
                <button key={v} onClick={() => setView(v as any)} className={`text-xs font-bold uppercase tracking-widest transition-all ${view === v ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>{v}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'documentation' ? (
            <Documentation onBack={() => setView('dashboard')} />
          ) : view === 'faq' ? (
            <FAQ onBack={() => setView('dashboard')} />
          ) : currentStage === PipelineStage.IDLE ? (
            <div className="space-y-24">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    v3 Multi-File Protocol
                  </div>
                  <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
                    Optimierte Workspaces <br/>
                    <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">für KI-Agenten.</span>
                  </h2>
                  <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                    Wir generieren nicht nur Prompts, sondern ein ganzes Projekt-Bundle optimiert für Cursor, Windsurf und dein bevorzugtes LLM.
                  </p>
                </div>
                <div className="relative group max-w-sm mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-25 transition duration-1000 group-hover:opacity-50"></div>
                  <button onClick={() => setCurrentStage(PipelineStage.ONBOARDING)} className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3">
                    Projekt starten
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </div>
              </div>
              <SavedProjectsList projects={savedProjects} onSelect={selectSavedProject} onDelete={deleteProject} />
            </div>
          ) : currentStage === PipelineStage.ONBOARDING ? (
            <InteractiveOnboarding onComplete={startPipeline} />
          ) : (
            <div className="space-y-16">
              <PipelineProgress currentStage={currentStage} />
              {currentStage === PipelineStage.ERROR && <div className="text-center text-rose-500">{error}</div>}
              {currentStage === PipelineStage.COMPLETED && currentProjectData && <ResultViewer result={result} projectData={currentProjectData} onReset={reset} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
