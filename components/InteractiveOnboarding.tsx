
import React, { useState, useEffect, useRef } from 'react';
import { ProjectData, InterviewState } from '../types';
import { generateNextInterviewQuestion, brainstormFeatures } from '../services/geminiService';
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

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({ onComplete }) => {
  const [data, setData] = useState<Partial<ProjectData>>({});
  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNextQuestion = async (currentData: Partial<ProjectData>) => {
    setIsLoading(true);
    try {
      const next = await generateNextInterviewQuestion(currentData);
      if (next.currentField === 'COMPLETE') {
        onComplete(currentData as ProjectData);
      } else {
        setInterview(next);
      }
    } catch (error) {
      console.error("Error fetching next question", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion({});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, interview, isLoading, isBrainstorming]);

  const handleSubmit = (e?: React.FormEvent, overrideValue?: string) => {
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
    
    if (field === 'keyFeatures') {
      newValue = trimmedValue.split(',').map(s => s.trim()).filter(s => s);
    }

    const updatedData = { ...data, [field]: newValue };
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
  };

  const updateFieldFromVoice = (field: keyof ProjectData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // We don't push to steps here to avoid flooding, but the data updates reactively
  };

  const useSuggestion = (text: string) => {
    if (interview?.currentField === 'keyFeatures') {
      setInputValue(prev => {
        const current = prev.trim();
        if (!current) return text;
        if (current.endsWith(',')) return `${current} ${text}`;
        return `${current}, ${text}`;
      });
    } else {
      handleSubmit(undefined, text);
    }
  };

  const handleBrainstorm = async () => {
    if (!data.description) return;
    setIsBrainstorming(true);
    try {
      const suggestions = await brainstormFeatures(data);
      if (interview) {
        setInterview({
          ...interview,
          suggestions: [...(interview.suggestions || []), ...suggestions]
        });
      }
    } catch (error) {
      console.error("Brainstorming failed", error);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const isKeyFeatures = interview?.currentField === 'keyFeatures';

  return (
    <div className="max-w-4xl mx-auto h-[750px] flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-2xl relative border-white/10">
      {isVoiceMode && (
        <VoiceScoping 
          currentData={data} 
          onUpdateField={updateFieldFromVoice} 
          onClose={() => {
            setIsVoiceMode(false);
            fetchNextQuestion(data);
          }} 
        />
      )}
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 z-20"></div>

      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
               <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Engineering Studio</h3>
            <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest">Scaling & Complexity Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsVoiceMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            Voice Mode
          </button>
          <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <div key={n} className={`w-3 h-1.5 rounded-full transition-all duration-700 ${steps.length >= n ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
              ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide">
        <div className="flex justify-start">
          <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl rounded-tl-none max-w-[85%]">
            <p className="text-slate-300 text-sm leading-relaxed">
              Willkommen. Sie können dieses Setup manuell durchführen oder unseren <strong>Voice-Modus</strong> nutzen, um Ihre Anforderungen direkt mit einer KI-Architektin zu besprechen.
            </p>
          </div>
        </div>

        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex justify-start">
               <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-3xl rounded-tl-none max-w-[85%] text-slate-300 text-sm">{step.question}</div>
            </div>
            <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
              <div className="bg-indigo-600 p-5 rounded-3xl rounded-tr-none max-w-[80%] text-white text-sm font-medium shadow-xl">
                {Array.isArray(step.answer) ? step.answer.join(', ') : step.answer}
              </div>
            </div>
          </React.Fragment>
        ))}

        {interview && !isLoading && !isVoiceMode && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex justify-start">
              <div className="bg-slate-800/60 border border-indigo-500/20 p-8 rounded-3xl rounded-tl-none max-w-[90%] shadow-2xl relative">
                <p className="text-white text-sm leading-relaxed font-medium">{interview.question}</p>
              </div>
            </div>
            
            <div className="space-y-4 ml-4">
              {isKeyFeatures && (
                <button 
                  onClick={handleBrainstorm}
                  disabled={isBrainstorming}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-5 py-2.5 rounded-2xl border border-indigo-500/20"
                >
                  KI brainstormt Features...
                </button>
              )}

              {interview.suggestions && (
                <div className="flex flex-wrap gap-3">
                  {interview.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => useSuggestion(s)}
                      className="text-[11px] font-bold bg-slate-800/60 hover:bg-indigo-500 hover:text-white text-indigo-300 px-5 py-3 rounded-2xl border border-white/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 px-6 py-4 rounded-full">
              <div className="flex gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-900/50 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            rows={isKeyFeatures ? 3 : 1}
            autoFocus
            disabled={isLoading || !interview || isVoiceMode}
            className={`w-full bg-slate-950/80 border-2 rounded-2xl px-6 py-5 pr-32 focus:outline-none text-white text-base transition-all ${isShaking ? 'animate-shake border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
            placeholder={isVoiceMode ? "Voice-Modus aktiv..." : "Deine Antwort..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
             {!isVoiceMode && (
               <>
                 <Button type="button" variant="secondary" size="sm" onClick={() => setIsVoiceMode(true)}>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V3a3 3 0 013-3z" /></svg>
                 </Button>
                 <Button type="submit" disabled={isLoading || !interview} size="sm">Bestätigen</Button>
               </>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};
