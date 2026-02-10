
import React, { useState, useEffect, useMemo } from 'react';
import { PipelineStage } from '../types';

interface PipelineProgressProps {
  currentStage: PipelineStage;
}

interface SubTask {
  label: string;
  stage: PipelineStage;
}

const SUB_TASKS: SubTask[] = [
  // Logic Stage (STRUCTURE)
  { label: 'Analysiere Projektanforderungen...', stage: PipelineStage.STRUCTURE },
  { label: 'Generiere Systemmodell-Dateien...', stage: PipelineStage.STRUCTURE },
  { label: 'Extrahiere Entitäten & Eigenschaften...', stage: PipelineStage.STRUCTURE },
  { label: 'Mappe Beziehungen (ER-Diagramm)...', stage: PipelineStage.STRUCTURE },
  { label: 'Validiere logische User-Flows...', stage: PipelineStage.STRUCTURE },
  
  // Architecture Stage (ARCHITECTURE)
  { label: 'Orchestriere Technologie-Stack...', stage: PipelineStage.ARCHITECTURE },
  { label: 'Definiere API-Endpunkte & Schemata...', stage: PipelineStage.ARCHITECTURE },
  { label: 'Erstelle detaillierte Parameter-Doku...', stage: PipelineStage.ARCHITECTURE },
  { label: 'Generiere Architektur-Diagramm (JSON)...', stage: PipelineStage.ARCHITECTURE },
  { label: 'Entwerfe Verzeichnisstruktur...', stage: PipelineStage.ARCHITECTURE },
  
  // Synthesis Stage (MASTER_PROMPT)
  { label: 'Kompiliere Projektkontext...', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Iniziere technische Guardrails...', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Synthetisiere Master-Prompt...', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Optimiere für LLM-Tokenisierung...', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Render finale Markdown-Ausgabe...', stage: PipelineStage.MASTER_PROMPT },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentStage }) => {
  const [activeSubTaskIndex, setActiveSubTaskIndex] = useState(0);

  const mainStages = [
    { key: PipelineStage.STRUCTURE, label: 'Logik', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { key: PipelineStage.ARCHITECTURE, label: 'Architektur', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { key: PipelineStage.MASTER_PROMPT, label: 'Synthese', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
  ];

  const currentStageSubTasks = useMemo(() => 
    SUB_TASKS.filter(t => t.stage === currentStage),
    [currentStage]
  );

  const progressPercentage = useMemo(() => {
    if (currentStage === PipelineStage.COMPLETED) return 100;
    if (currentStageSubTasks.length === 0) return 0;
    return Math.round(((activeSubTaskIndex + 1) / currentStageSubTasks.length) * 100);
  }, [activeSubTaskIndex, currentStageSubTasks, currentStage]);

  const getStageStatus = (stage: PipelineStage) => {
    const stageOrder = [PipelineStage.STRUCTURE, PipelineStage.ARCHITECTURE, PipelineStage.MASTER_PROMPT, PipelineStage.COMPLETED];
    const currentIndex = stageOrder.indexOf(currentStage);
    const itemIndex = stageOrder.indexOf(stage);

    if (currentStage === PipelineStage.ERROR) return 'error';
    if (currentIndex > itemIndex) return 'completed';
    if (currentIndex === itemIndex) return 'active';
    return 'pending';
  };

  useEffect(() => {
    if (currentStage === PipelineStage.COMPLETED || currentStage === PipelineStage.ERROR) return;

    if (currentStageSubTasks.length === 0) return;

    let timer: number;
    const iterateSubTasks = (index: number) => {
      setActiveSubTaskIndex(index);
      if (index < currentStageSubTasks.length - 1) {
        // Speed up the simulation for better UX as we have more tasks now
        timer = window.setTimeout(() => iterateSubTasks(index + 1), 1800);
      }
    };

    iterateSubTasks(0);
    return () => clearTimeout(timer);
  }, [currentStage, currentStageSubTasks]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Visual Stepper with Internal Progress */}
      <div className="flex items-center justify-between relative px-10">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
           <div 
             className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out"
             style={{ width: `${
               currentStage === PipelineStage.COMPLETED ? 100 :
               currentStage === PipelineStage.STRUCTURE ? (progressPercentage * 0.33) :
               currentStage === PipelineStage.ARCHITECTURE ? (33 + progressPercentage * 0.33) :
               currentStage === PipelineStage.MASTER_PROMPT ? (66 + progressPercentage * 0.33) : 0
             }%` }}
           ></div>
        </div>
        
        {mainStages.map((s, idx) => {
          const status = getStageStatus(s.key);
          const isActive = status === 'active';
          
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
              <div 
                className={`w-16 h-16 rounded-[1.25rem] flex flex-col items-center justify-center border-2 transition-all duration-700 relative overflow-hidden
                ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 
                  status === 'active' ? 'bg-slate-900 border-indigo-400 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]' : 
                  'bg-slate-950 border-slate-800 text-slate-700'}`}
              >
                {/* Background Progress Fill for Active Stage */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-indigo-600/20 transition-all duration-500" 
                    style={{ height: `${progressPercentage}%` }}
                  ></div>
                )}

                {status === 'completed' ? (
                  <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className={`w-7 h-7 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <span className={`text-[10px] block font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                  {s.label}
                </span>
                {isActive && (
                  <span className="text-[9px] font-mono text-indigo-500 animate-pulse">{progressPercentage}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Console View - Granular Task List */}
      <div className="glass rounded-[2rem] overflow-hidden border-indigo-500/10 shadow-2xl">
        <div className="bg-slate-900/80 px-8 py-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
                <div className="h-4 w-[1px] bg-slate-800 mx-2"></div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Process Inspector v2.5</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <span className="text-[10px] font-mono text-indigo-400">STAGE_{currentStage}</span>
                </div>
            </div>
        </div>
        
        <div className="p-8 space-y-4 bg-[#020617]/60 max-h-[400px] overflow-y-auto scrollbar-hide">
          {SUB_TASKS.map((task, idx) => {
            const taskStageStatus = getStageStatus(task.stage);
            const isStageActive = taskStageStatus === 'active';
            const isStageCompleted = taskStageStatus === 'completed';
            
            const stageTasks = SUB_TASKS.filter(t => t.stage === task.stage);
            const taskIndexInStage = stageTasks.indexOf(task);
            const isSubTaskActive = isStageActive && taskIndexInStage === activeSubTaskIndex;
            const isSubTaskDone = isStageCompleted || (isStageActive && taskIndexInStage < activeSubTaskIndex);

            // Only show tasks for the current, previous, and next stage to maintain focus
            const stageOrder = [PipelineStage.STRUCTURE, PipelineStage.ARCHITECTURE, PipelineStage.MASTER_PROMPT];
            const currentStageIdx = stageOrder.indexOf(currentStage as any);
            const taskStageIdx = stageOrder.indexOf(task.stage as any);
            
            if (currentStage !== PipelineStage.COMPLETED && Math.abs(currentStageIdx - taskStageIdx) > 0 && !isSubTaskDone) {
               // Only hide if it's far in the future
               if (taskStageIdx > currentStageIdx) return null;
            }
            
            // Limit shown completed tasks to keep the console clean
            if (isSubTaskDone && Math.abs(currentStageIdx - taskStageIdx) > 1) return null;

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-5 transition-all duration-500 ${isSubTaskActive ? 'translate-x-2 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10' : 'p-3'}`}
              >
                <div className="pt-1">
                    {isSubTaskDone ? (
                        <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    ) : isSubTaskActive ? (
                        <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                             <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium font-mono tracking-tight transition-colors duration-300 ${isSubTaskActive ? 'text-white' : isSubTaskDone ? 'text-slate-500' : 'text-slate-700'}`}>
                            {isSubTaskActive && <span className="text-indigo-500 mr-2">➜</span>}
                            {task.label}
                        </span>
                        {isSubTaskActive && (
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-indigo-500 animate-pulse">RUNNING</span>
                              <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500 animate-[loading_1.5s_infinite]"></div>
                              </div>
                           </div>
                        )}
                        {isSubTaskDone && <span className="text-[9px] font-mono text-emerald-600/60 uppercase tracking-tighter">Verified</span>}
                    </div>
                </div>
              </div>
            );
          })}
          
          {currentStage === PipelineStage.COMPLETED && (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-500">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
               </div>
               <h4 className="text-emerald-400 font-bold mb-1">Synthese abgeschlossen</h4>
               <p className="text-slate-500 text-xs">Alle architektonischen Komponenten wurden erfolgreich kompiliert.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
