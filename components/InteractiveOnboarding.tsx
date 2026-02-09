
import React, { useState, useEffect, useRef } from 'react';
import { ProjectData, InterviewState } from '../types';
import { generateNextInterviewQuestion } from '../services/geminiService';
import { Button } from './Button';

interface InteractiveOnboardingProps {
  onComplete: (data: ProjectData) => void;
}

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({ onComplete }) => {
  const [data, setData] = useState<Partial<ProjectData>>({});
  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [steps, setSteps] = useState<{ field: string; answer: string; question: string }[]>([]);
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
      setValidationError("Verbindung zum KI-Dienst fehlgeschlagen. Bitte versuchen Sie es erneut.");
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
  }, [steps, interview, isLoading]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interview) return;

    setValidationError(null);
    const trimmedValue = inputValue.trim();

    // Basic required field validation
    if (!trimmedValue) {
      setValidationError("Dieses Feld darf nicht leer sein.");
      triggerShake();
      return;
    }

    const field = interview.currentField as keyof ProjectData;
    let newValue: any = trimmedValue;
    
    // Specific validation for keyFeatures
    if (field === 'keyFeatures') {
      const features = trimmedValue.split(',').map(s => s.trim()).filter(s => s);
      
      if (features.length === 0) {
        setValidationError("Bitte geben Sie mindestens eine Funktion ein.");
        triggerShake();
        return;
      }
      
      if (features.length === 1 && !trimmedValue.includes(',')) {
        // Optional: Suggest using commas if they only put one item without a comma
        // But we allow it as a "list of one". If we want strictness:
        // setValidationError("Bitte verwenden Sie Kommas, um mehrere Funktionen zu trennen.");
        // triggerShake();
        // return;
      }
      
      newValue = features;
    }

    const updatedData = { ...data, [field]: newValue };
    setData(updatedData);
    setSteps([...steps, { field: interview.currentField, answer: trimmedValue, question: interview.question }]);
    setInputValue('');
    setInterview(null);
    
    fetchNextQuestion(updatedData);
  };

  const useSuggestion = (text: string) => {
    setValidationError(null);
    setInputValue(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return text;
      if (trimmed.endsWith(',')) return `${trimmed} ${text}`;
      return `${trimmed}, ${text}`;
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col glass rounded-[2rem] overflow-hidden shadow-2xl relative">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 z-20"></div>

      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
               <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0f172a] animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">KI-Architekt</h3>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Anforderungsphase aktiv</p>
          </div>
        </div>
        <div className="flex gap-2">
            {[1,2,3,4].map(n => (
                <div key={n} className={`w-8 h-1.5 rounded-full transition-colors duration-500 ${steps.length >= n ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide">
        {/* Welcome Message */}
        <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl rounded-tl-none max-w-[85%]">
            <p className="text-slate-300 text-sm leading-relaxed">Willkommen im Studio. Ich helfe Ihnen dabei, Ihr Softwareprojekt präzise zu definieren. Lassen Sie uns beginnen.</p>
          </div>
        </div>

        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex justify-start">
               <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl rounded-tl-none max-w-[85%]">
                <p className="text-slate-300 text-sm leading-relaxed">{step.question}</p>
              </div>
            </div>
            <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-indigo-600 shadow-lg p-5 rounded-2xl rounded-tr-none max-w-[80%]">
                <p className="text-white text-sm font-medium">{step.answer}</p>
              </div>
            </div>
          </React.Fragment>
        ))}

        {interview && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-indigo-500/20 p-6 rounded-3xl rounded-tl-none max-w-[90%] shadow-xl">
                <p className="text-white text-sm leading-relaxed font-medium">{interview.question}</p>
              </div>
            </div>
            
            {interview.suggestions && interview.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-4">
                {interview.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => useSuggestion(s)}
                    className="text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 border border-slate-700/50 px-6 py-4 rounded-full rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-900/50 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <div className={`transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
            <input
              autoFocus
              disabled={isLoading || !interview}
              type="text"
              className={`w-full bg-slate-950/80 border-2 rounded-2xl px-6 py-5 pr-32 focus:ring-0 focus:outline-none text-white text-base transition-all placeholder:text-slate-600 disabled:opacity-50 shadow-inner ${validationError ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
              placeholder={interview?.currentField === 'keyFeatures' ? "z.B. Login, Dashboard, API (kommagetrennt)..." : "Schreiben Sie etwas..."}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validationError) setValidationError(null);
              }}
            />
            {validationError && (
              <div className="absolute -top-7 left-2 flex items-center gap-1.5 text-rose-400 text-xs font-semibold animate-in fade-in slide-in-from-bottom-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {validationError}
              </div>
            )}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <Button 
                type="submit" 
                disabled={isLoading || !interview}
                className={`py-3 px-6 rounded-xl transition-all ${!inputValue.trim() ? 'opacity-40 grayscale' : 'opacity-100'}`}
                size="sm"
             >
                Senden
             </Button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};
