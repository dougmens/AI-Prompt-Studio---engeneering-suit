
import React, { useEffect, useState } from 'react';
import { ProjectData, RefinementSuggestion } from '../types';
import { analyzeComponent } from '../services/geminiService';
import { Button } from './Button';

interface RefinementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  target: string | null;
  projectData: ProjectData;
}

export const RefinementDrawer: React.FC<RefinementDrawerProps> = ({ isOpen, onClose, target, projectData }) => {
  const [suggestions, setSuggestions] = useState<RefinementSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && target) {
      setLoading(true);
      analyzeComponent(target, projectData)
        .then(setSuggestions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, target, projectData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] z-[250] animate-in slide-in-from-right duration-500">
      <div className="h-full glass border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-xl font-black text-white">Komponenten-Inspektor</h3>
            <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest mt-1">Refinement Agent active</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ziel-Element</span>
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300 font-bold">
              {target}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-slate-500 uppercase animate-pulse">Analysiere Codebase...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {suggestions.map((s, i) => (
                <div key={i} className="p-6 bg-slate-950/40 border border-white/5 rounded-[2rem] space-y-4 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      s.type === 'performance' ? 'bg-amber-500/10 text-amber-500' :
                      s.type === 'refactor' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {s.type}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">{s.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                  {s.codeSnippet && (
                    <div className="relative group">
                      <pre className="p-4 bg-slate-950 rounded-xl text-[10px] font-mono text-indigo-300/80 overflow-x-auto border border-white/5">
                        {s.codeSnippet}
                      </pre>
                      <button 
                        onClick={() => navigator.clipboard.writeText(s.codeSnippet || '')}
                        className="absolute top-2 right-2 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-slate-900/40">
          <Button variant="ghost" onClick={onClose} className="w-full">Schließen</Button>
        </div>
      </div>
    </div>
  );
};
