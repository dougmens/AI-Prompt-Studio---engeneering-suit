
import React, { useState, useEffect } from 'react';
import { PipelineStage } from '../types';

interface PipelineProgressProps {
  currentStage: PipelineStage;
}

interface SubTask {
  label: string;
  stage: PipelineStage;
}

const SUB_TASKS: SubTask[] = [
  { label: 'Anforderungsanalyse', stage: PipelineStage.STRUCTURE },
  { label: 'Entitäten-Extraktion', stage: PipelineStage.STRUCTURE },
  { label: 'Beziehungs-Mapping', stage: PipelineStage.STRUCTURE },
  { label: 'Stack-Orchestrierung', stage: PipelineStage.ARCHITECTURE },
  { label: 'API-Blueprint', stage: PipelineStage.ARCHITECTURE },
  { label: 'Filesystem-Template', stage: PipelineStage.ARCHITECTURE },
  { label: 'Context Compilation', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Syntaktische Optimierung', stage: PipelineStage.MASTER_PROMPT },
  { label: 'Markdown Rendering', stage: PipelineStage.MASTER_PROMPT },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentStage }) => {
  const [activeSubTaskIndex, setActiveSubTaskIndex] = useState(0);

  const mainStages = [
    { key: PipelineStage.STRUCTURE, label: 'Logik' },
    { key: PipelineStage.ARCHITECTURE, label: 'Architektur' },
    { key: PipelineStage.MASTER_PROMPT, label: 'Synthese' }
  ];

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

    const currentSubTasks = SUB_TASKS.filter(t => t.stage === currentStage);
    if (currentSubTasks.length === 0) return;

    let timer: number;
    const iterateSubTasks = (index: number) => {
      setActiveSubTaskIndex(index);
      if (index < currentSubTasks.length - 1) {
        timer = window.setTimeout(() => iterateSubTasks(index + 1), 2500);
      }
    };

    iterateSubTasks(0);
    return () => clearTimeout(timer);
  }, [currentStage]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between relative px-10">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2"></div>
        {mainStages.map((s, idx) => {
          const status = getStageStatus(s.key);
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-700
                ${status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                  status === 'active' ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] animate-pulse' : 
                  'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                {status === 'completed' ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="font-bold text-lg">{idx + 1}</span>
                )}
              </div>
              <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${status === 'active' ? 'text-indigo-400' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Technical Console View */}
      <div className="glass rounded-3xl overflow-hidden border-indigo-500/10 shadow-2xl">
        <div className="bg-slate-900/80 px-8 py-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-4">System Processing Log</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-indigo-400 animate-pulse">EXECUTING...</span>
            </div>
        </div>
        
        <div className="p-8 space-y-6 bg-[#020617]/40">
          {SUB_TASKS.map((task, idx) => {
            const taskStageStatus = getStageStatus(task.stage);
            const isStageActive = taskStageStatus === 'active';
            const isStageCompleted = taskStageStatus === 'completed';
            
            const stageTasks = SUB_TASKS.filter(t => t.stage === task.stage);
            const taskIndexInStage = stageTasks.indexOf(task);
            const isSubTaskActive = isStageActive && taskIndexInStage === activeSubTaskIndex;
            const isSubTaskDone = isStageCompleted || (isStageActive && taskIndexInStage < activeSubTaskIndex);

            const stageOrder = [PipelineStage.STRUCTURE, PipelineStage.ARCHITECTURE, PipelineStage.MASTER_PROMPT];
            const currentStageIdx = stageOrder.indexOf(currentStage as any);
            const taskStageIdx = stageOrder.indexOf(task.stage as any);
            
            if (Math.abs(currentStageIdx - taskStageIdx) > 1 && currentStage !== PipelineStage.COMPLETED) return null;

            return (
              <div key={idx} className={`flex items-start gap-5 transition-all duration-500 ${isSubTaskActive ? 'translate-x-2' : ''}`}>
                <div className="pt-1">
                    {isSubTaskDone ? (
                        <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    ) : isSubTaskActive ? (
                        <div className="w-5 h-5 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                             <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                             <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold mono tracking-tight ${isSubTaskActive ? 'text-white' : isSubTaskDone ? 'text-slate-400' : 'text-slate-600'}`}>
                            {isSubTaskActive && '> '}{task.label}
                        </span>
                        {isSubTaskActive && <span className="text-[10px] mono text-indigo-500">PENDING</span>}
                        {isSubTaskDone && <span className="text-[10px] mono text-emerald-600">SUCCESS</span>}
                    </div>
                    {isSubTaskActive && (
                        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-[loading_2s_infinite]"></div>
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(0%); }
          50% { width: 70%; transform: translateX(30%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
