
import React, { useState, useRef, useEffect } from 'react';
import { askArchitect } from '../services/geminiService';
import { Button } from './Button';

export const ArchitectChat: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string, sources?: any[]}[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await askArchitect(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response.text, sources: response.sources }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred during reasoning." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass rounded-[3rem] border-white/10 overflow-hidden bg-slate-950/20">
      <div className="p-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">Architect Copilot</h3>
               <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">Reasoning Mode: Max (32k Tokens)</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-mono">Live Search Enabled</span>
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="text-6xl">🤖</div>
            <p className="text-slate-400 max-w-sm">Frag mich nach Cloud-Architekturen, UI-Trends oder komplexen Code-Strukturen.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
             <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900/80 text-slate-300 border border-white/5 rounded-tl-none'}`}>
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grounding Sources:</p>
                     <div className="flex flex-wrap gap-2">
                        {m.sources.map((s, idx) => (
                          <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 underline truncate max-w-[200px]">{s.title}</a>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-900/40 px-8 py-5 rounded-[2rem] flex items-center gap-4 border border-white/5">
               <div className="flex gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>
               <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest animate-pulse">Deep Reasoning in Progress...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-slate-900/40">
        <form onSubmit={handleSend} className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-indigo-500 transition-all pr-20"
          />
          <button type="submit" disabled={isThinking} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all disabled:opacity-50">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};
