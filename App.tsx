
import React, { useState, useCallback } from 'react';
import { ProjectData, PipelineStage, PipelineResult } from './types';
import { generateStage1Structure, generateStage2Architecture, generateStage3MasterPrompt } from './services/geminiService';
import { InteractiveOnboarding } from './components/InteractiveOnboarding';
import { PipelineProgress } from './components/PipelineProgress';
import { ResultViewer } from './components/ResultViewer';
import { Documentation } from './components/Documentation';
import { FAQ } from './components/FAQ';
// Fix: Added missing import for Button component
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'documentation' | 'faq'>('dashboard');
  const [currentStage, setCurrentStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [result, setResult] = useState<PipelineResult>({});
  const [error, setError] = useState<string | null>(null);

  const startPipeline = useCallback(async (projectData: ProjectData) => {
    setError(null);
    setResult({});
    
    try {
      setCurrentStage(PipelineStage.STRUCTURE);
      const stage1 = await generateStage1Structure(projectData);
      setResult(prev => ({ ...prev, stage1 }));

      setCurrentStage(PipelineStage.ARCHITECTURE);
      const stage2 = await generateStage2Architecture(stage1);
      setResult(prev => ({ ...prev, stage2 }));

      setCurrentStage(PipelineStage.MASTER_PROMPT);
      const stage3 = await generateStage3MasterPrompt(projectData, stage1, stage2);
      setResult(prev => ({ ...prev, stage3 }));

      setCurrentStage(PipelineStage.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
      setCurrentStage(PipelineStage.ERROR);
    }
  }, []);

  const reset = () => {
    setCurrentStage(PipelineStage.IDLE);
    setResult({});
    setError(null);
    setView('dashboard');
  };

  const handleStartOnboarding = () => {
    setCurrentStage(PipelineStage.ONBOARDING);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={reset}
          >
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">Prompt Studio</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Engineering Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {['dashboard', 'documentation', 'faq'].map((v) => (
                <button 
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`text-xs font-bold uppercase tracking-widest transition-all ${view === v ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>
            <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Gemini Pro connected</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'documentation' ? (
            <Documentation onBack={() => setView('dashboard')} />
          ) : view === 'faq' ? (
            <FAQ onBack={() => setView('dashboard')} />
          ) : currentStage === PipelineStage.IDLE ? (
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                  v2.5 Architecture Engine
                </div>
                <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-tight">
                  Präzise Software-Pläne <br/>
                  <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">durch KI-Architektur.</span>
                </h2>
                <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                  Vom Konzept zum Master-Prompt in 3 Stufen. Wir analysieren Ihre Logik, definieren den Tech-Stack und erstellen die perfekte Blaupause.
                </p>
              </div>

              <div className="relative group max-w-sm mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  onClick={handleStartOnboarding}
                  className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  Projekt starten
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                  { title: "Smart Extraction", desc: "KI erkennt automatisch Entitäten und Flows." },
                  { title: "Stack Blueprint", desc: "Optimierte Tech-Stack Empfehlungen." },
                  { title: "Agent Ready", desc: "Formatierte Prompts für Coding-Agenten." }
                ].map((feature, i) => (
                  <div key={i} className="glass p-6 rounded-2xl text-left hover:border-indigo-500/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 font-bold text-sm">0{i+1}</div>
                    <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : currentStage === PipelineStage.ONBOARDING ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <InteractiveOnboarding onComplete={startPipeline} />
            </div>
          ) : (
            <div className="space-y-16 animate-in fade-in duration-700">
              <PipelineProgress currentStage={currentStage} />
              
              {currentStage === PipelineStage.ERROR && (
                <div className="max-w-2xl mx-auto glass border-rose-500/30 p-10 rounded-3xl text-center space-y-6">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Pipeline fehlgeschlagen</h3>
                  <p className="text-rose-300 font-medium">{error}</p>
                  <Button variant="outline" onClick={reset} className="mt-4">Zurück zum Start</Button>
                </div>
              )}

              {currentStage === PipelineStage.COMPLETED && (
                <ResultViewer result={result} onReset={reset} />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Prompt Engineering Studio</span>
                <span>© 2024</span>
            </div>
            <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
