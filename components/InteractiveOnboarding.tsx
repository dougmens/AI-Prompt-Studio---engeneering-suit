
import React, { useState, useEffect, useRef } from 'react';
import { ProjectData, InterviewState, ProjectEstimation } from '../types';
import { generateNextInterviewQuestion, brainstormFeatures, analyzeExistingProduct, generateMarketingStrategy, generateProjectEstimation } from '../services/geminiService';
import { Button } from './Button';
import { VoiceScoping } from './VoiceScoping';

interface Step {
  field: string;
  answer: string;
  question: string;
  suggestions?: string[];
}

interface InteractiveOnboardingProps {
  onComplete: (data: ProjectData) => void;
}

const PHASES = [
  { id: 'analysis', label: 'Analyse', fields: ['title', 'description', 'rebuildSource'] },
  { id: 'business', label: 'Kommerz', fields: ['monetizationModel', 'authMethods', 'adminPanelRequired'] },
  { id: 'ops', label: 'Growth & Ops', fields: ['i18nRequired', 'complianceLevel', 'analyticsTool', 'ciCdPreference'] },
  { id: 'strategy', label: 'Strategie', fields: ['marketingStrategy', 'keyFeatures'] },
  { id: 'execution', label: 'Setup', fields: ['projectScope', 'complexity', 'ide', 'preferredModel'] }
];

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({ onComplete }) => {
  const [data, setData] = useState<Partial<ProjectData>>({});
  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isAnalyzingMarketing, setIsAnalyzingMarketing] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNextQuestion = async (currentData: Partial<ProjectData>) => {
    setIsLoading(true);
    try {
      const next = await generateNextInterviewQuestion(currentData);
      if (next.currentField === 'COMPLETE' || !next.currentField) {
        handleFinalStep(currentData);
      } else {
        setInterview(next);
      }
    } catch (error) {
      console.error("Error fetching next question", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalStep = async (currentData: Partial<ProjectData>) => {
    setIsEstimating(true);
    try {
      const estimation = await generateProjectEstimation(currentData);
      const finalData = { ...currentData, estimation };
      setData(finalData);
      setShowSummary(true);
    } catch (err) {
      console.error("Estimation failed", err);
      setShowSummary(true);
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion({});
  }, []);

  useEffect(() => {
    if (data.title && data.description && data.targetAudience && !data.marketingStrategy && !isAnalyzingMarketing) {
      handleMarketingAnalysis();
    }
  }, [data.targetAudience, data.description]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, interview, isLoading, isResearching, isAnalyzingMarketing]);

  const handleMarketingAnalysis = async () => {
    setIsAnalyzingMarketing(true);
    try {
      const strategy = await generateMarketingStrategy(data);
      setData(prev => ({ ...prev, marketingStrategy: strategy }));
    } catch (err) {
      console.error("Marketing analysis failed", err);
    } finally {
      setIsAnalyzingMarketing(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideValue?: string) => {
    if (e) e.preventDefault();
    if (!interview) return;

    const valueToSubmit = overrideValue || inputValue;
    const trimmedValue = valueToSubmit.trim();

    if (!trimmedValue) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const field = interview.currentField as keyof ProjectData;
    let newValue: any = trimmedValue;
    
    if (field === 'keyFeatures' || field === 'authMethods') {
      newValue = trimmedValue.split(',').map(s => s.trim()).filter(s => s);
    }
    
    if (field === 'adminPanelRequired' || field === 'i18nRequired') {
      newValue = trimmedValue.toLowerCase().includes('ja') || trimmedValue.toLowerCase().includes('yes');
    }

    const updatedData = { ...data, [field]: newValue };

    if (field === 'rebuildSource' && trimmedValue.length > 2 && !trimmedValue.toLowerCase().includes('nein')) {
      triggerResearch(trimmedValue, updatedData);
    } else {
      setData(updatedData);
      setSteps([...steps, { 
        field: interview.currentField, 
        answer: trimmedValue, 
        question: interview.question,
        suggestions: interview.suggestions 
      }]);
      setInputValue('');
      setInterview(null);
      fetchNextQuestion(updatedData);
    }
  };

  const triggerResearch = async (source: string, currentData: Partial<ProjectData>) => {
    setIsResearching(true);
    try {
      const analysis = await analyzeExistingProduct(source);
      const finalData = { ...currentData, rebuildAnalysis: analysis };
      setData(finalData);
      setSteps([...steps, { 
        field: 'rebuildSource', 
        answer: source, 
        question: interview?.question || 'Rebuild Source',
        suggestions: [] 
      }]);
      setInputValue('');
      setInterview(null);
      fetchNextQuestion(finalData);
    } catch (err) {
      console.error("Research Agent failed", err);
    } finally {
      setIsResearching(false);
    }
  };

  const downloadProjectBundle = () => {
    const readme = `# Blueprint: ${data.title}\n\n${data.description}\n\n## Value Proposition\n${data.marketingStrategy?.usp}\n\n## Estimated Savings (ROI)\nManual Cost: ${data.estimation?.roiComparison?.manualCost}€\nAI-Native Cost: ${data.estimation?.totalCostEstimateEur}€\nTotal Savings: ${data.estimation?.roiComparison?.savingsEur}€`;
    
    const combined = `
--- FILE: README.md ---
${readme}

--- FILE: ARCHITECTURE.md ---
# Architecture Specs\n\nScope: ${data.projectScope}\nComplexity: ${data.complexity}\n\nStack: ${data.preferredModel} / ${data.hostingDeployment}

--- FILE: BUSINESS_STRATEGY.md ---
SWOT: ${JSON.stringify(data.marketingStrategy?.swot)}
Monetization: ${data.monetizationModel}
    `.trim();

    const blob = new Blob([combined], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title?.replace(/\s+/g, '_')}_Blueprint_Bundle.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showSummary) {
    return (
      <div className="max-w-6xl mx-auto glass rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 bg-slate-950/40 border-white/10 flex flex-col h-[820px]">
        <div className="p-12 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-3xl">
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Business & Project Summary</h2>
              <p className="text-indigo-400 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">Ready for AI-Augmented Development</p>
           </div>
           <Button variant="primary" onClick={downloadProjectBundle} className="gap-3 px-8 shadow-indigo-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4 4m0 0l-4-4m4 4V4" /></svg>
              Blueprint Bundle Downloaden
           </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide bg-gradient-to-b from-transparent to-slate-900/10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marktkern</span>
                       <h3 className="text-xl font-bold text-white leading-snug">{data.title}</h3>
                       <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{data.description}</p>
                    </div>
                    <div className="p-8 bg-indigo-600/5 rounded-[2.5rem] border border-indigo-500/10 space-y-4">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Value Proposition</span>
                       <p className="text-sm text-indigo-100 font-bold leading-relaxed">{data.marketingStrategy?.usp}</p>
                    </div>
                 </div>

                 {/* ROI Visualization */}
                 <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] space-y-8">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2">Blueprint ROI Analyse</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                       <div className="space-y-2">
                          <span className="text-xs text-slate-500 block">Manuelle Umsetzung</span>
                          <p className="text-2xl font-bold text-slate-400 line-through">~{data.estimation?.roiComparison?.manualCost}€</p>
                          <span className="text-[10px] text-slate-600 italic">Basis: {data.estimation?.roiComparison?.manualHours}h Entwicklung</span>
                       </div>
                       <div className="space-y-2">
                          <span className="text-xs text-slate-500 block">AI-Native Blueprint</span>
                          <p className="text-2xl font-bold text-white">{data.estimation?.totalCostEstimateEur}€</p>
                          <span className="text-[10px] text-indigo-500 italic">Inkl. API & Infrastructure</span>
                       </div>
                       <div className="bg-emerald-500 p-8 rounded-[2rem] flex flex-col justify-center items-center text-center shadow-xl shadow-emerald-500/20">
                          <span className="text-[9px] font-black text-emerald-950 uppercase tracking-widest mb-1">Ihr Sparpotenzial</span>
                          <p className="text-3xl font-black text-emerald-950 tracking-tighter">{data.estimation?.roiComparison?.savingsEur}€</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-900/30 rounded-[2.5rem] border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Begründung der Kalkulation</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{data.estimation?.justification}"</p>
                 </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                 <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[3rem] space-y-8 shadow-[0_0_50px_rgba(245,158,11,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
                    <div className="space-y-2">
                       <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Empfohlenes Budget</span>
                       <div className="text-5xl font-black text-white tracking-tighter">{data.estimation?.totalCostEstimateEur}€</div>
                    </div>
                    
                    <div className="space-y-5 pt-8 border-t border-amber-500/10">
                       <div className="flex justify-between items-center group">
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Netto-Entwicklungszeit</span>
                          <span className="text-sm font-black text-slate-200">{data.estimation?.effortHours}h</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Projekt-Dauer</span>
                          <span className="text-sm font-black text-slate-200">{data.estimation?.durationWeeks} Wochen</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Token-Volumen</span>
                          <span className="text-sm font-black text-slate-200">~{data.estimation?.tokenEstimate}M Tokens</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">API-Kosten (Est.)</span>
                          <span className="text-sm font-black text-emerald-500">{data.estimation?.apiCostEstimateEur}€</span>
                       </div>
                       <div className="flex justify-between items-center group">
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Hosting p.M.</span>
                          <span className="text-sm font-black text-slate-200">{data.estimation?.hostingCostMonthlyEur}€</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] flex items-center gap-5 group hover:bg-emerald-500/10 transition-all cursor-default">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">AI-Ready Score</span>
                       <p className="text-lg font-bold text-white tracking-tight">Hoch (Optimiert)</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-12 bg-slate-900/60 border-t border-white/10 flex items-center justify-between backdrop-blur-3xl">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <p className="text-sm text-slate-400 font-medium">Scoping erfolgreich abgeschlossen. Alle Blueprints sind generiert.</p>
           </div>
           <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowSummary(false)} className="px-8">Zurück</Button>
              <Button size="lg" onClick={() => onComplete(data as ProjectData)} className="px-12 shadow-indigo-500/30">
                 Blueprint generieren & Finalisieren
              </Button>
           </div>
        </div>
      </div>
    );
  }

  const getCurrentPhaseIndex = () => {
    if (!interview) return PHASES.length - 1;
    return PHASES.findIndex(p => p.fields.includes(interview.currentField as string));
  };

  const currentPhaseIndex = getCurrentPhaseIndex();

  return (
    <div className="max-w-4xl mx-auto h-[780px] flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-2xl relative border-white/10">
      {isVoiceMode && (
        <VoiceScoping 
          currentData={data} 
          onUpdateField={(f, v) => setData(p => ({ ...p, [f]: v }))} 
          onClose={() => { setIsVoiceMode(false); fetchNextQuestion(data); }} 
        />
      )}
      
      <div className="bg-slate-950/80 px-8 py-5 border-b border-white/5 flex items-center justify-between z-20 backdrop-blur-xl">
        <div className="flex items-center gap-8 w-full max-w-2xl">
          {PHASES.map((phase, idx) => (
            <div key={phase.id} className="flex items-center gap-3 relative">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-700 ${
                 currentPhaseIndex > idx ? 'bg-emerald-500 text-white' : 
                 currentPhaseIndex === idx ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-110' : 
                 'bg-slate-800 text-slate-500'
               }`}>
                 {currentPhaseIndex > idx ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                 ) : idx + 1}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-widest ${currentPhaseIndex === idx ? 'text-white' : 'text-slate-500'}`}>
                 {phase.label}
               </span>
               {idx < PHASES.length - 1 && (
                 <div className={`w-12 h-0.5 ml-2 hidden lg:block ${currentPhaseIndex > idx ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
               )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsVoiceMode(true)} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-500/20 transition-all">Live Voice</button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide bg-gradient-to-b from-transparent to-slate-900/20">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex justify-start">
               <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2rem] rounded-tl-none max-w-[85%] text-slate-300 text-sm leading-relaxed">{step.question}</div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-600 p-5 rounded-[2rem] rounded-tr-none max-w-[80%] text-white text-sm font-semibold shadow-xl border border-indigo-500/30">
                {Array.isArray(step.answer) ? step.answer.join(', ') : (typeof step.answer === 'boolean' ? (step.answer ? 'Ja' : 'Nein') : step.answer)}
              </div>
            </div>
          </React.Fragment>
        ))}

        {interview && !isLoading && !isVoiceMode && !isResearching && !isAnalyzingMarketing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex justify-start">
              <div className="bg-slate-800/60 border border-indigo-500/20 p-8 rounded-[2rem] rounded-tl-none max-w-[90%] shadow-2xl relative">
                <p className="text-white text-base leading-relaxed font-semibold">{interview.question}</p>
              </div>
            </div>
            
            <div className="space-y-4 ml-4">
              {interview.suggestions && (
                <div className="flex flex-wrap gap-3">
                  {interview.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(undefined, s)}
                      className="group relative text-[11px] font-black bg-slate-900/80 hover:bg-indigo-600 hover:text-white text-indigo-400 px-6 py-4 rounded-2xl border border-white/5 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      {currentPhaseIndex === PHASES.findIndex(p => p.id === 'strategy') && <span className="text-indigo-500 group-hover:text-white">✨</span>}
                      {currentPhaseIndex === PHASES.findIndex(p => p.id === 'business') && <span className="text-amber-500 group-hover:text-white">💰</span>}
                      {currentPhaseIndex === PHASES.findIndex(p => p.id === 'ops') && <span className="text-emerald-500 group-hover:text-white">🚀</span>}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(isLoading || isResearching || isAnalyzingMarketing || isEstimating) && !interview && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 px-8 py-4 rounded-full flex items-center gap-4 border border-white/5 shadow-xl">
              <div className="flex gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-black">
                {isResearching ? 'Marktforschung...' : isEstimating ? 'Wirtschaftliche Kalkulation...' : 'Management-Analyse...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {!showSummary && (
        <div className="p-8 bg-slate-950/80 border-t border-white/10 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="relative group">
            <textarea
              rows={1}
              autoFocus
              disabled={isLoading || isResearching || isAnalyzingMarketing || isEstimating || !interview || isVoiceMode}
              className={`w-full bg-slate-900/80 border-2 rounded-[1.5rem] px-8 py-5 pr-32 focus:outline-none text-white text-base transition-all resize-none shadow-inner ${isShaking ? 'animate-shake border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
              placeholder={isVoiceMode ? "Voice-Modus aktiv..." : "Antwort eingeben..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
               <Button type="submit" disabled={isLoading || isResearching || isAnalyzingMarketing || isEstimating || !interview} size="sm" className="rounded-xl px-6">
                  Senden
               </Button>
            </div>
          </form>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] mt-4 text-center">Protocol V4.0 • Blueprint Growth Engine</p>
        </div>
      )}
    </div>
  );
};
