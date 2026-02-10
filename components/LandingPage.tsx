
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate }) => {
  return (
    <div className="relative">
      {/* Dynamic Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[200px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-64 pb-48 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-20">
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl backdrop-blur-xl">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              The New Standard in AI-Native Conception
            </div>
            
            <h1 className="text-8xl sm:text-[10rem] font-black tracking-[calc(-0.04em)] text-white leading-[0.82] lg:max-w-6xl mx-auto">
              Master the <br/>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-blue-500 bg-clip-text text-transparent">AI-Native Stack.</span>
            </h1>
            
            <p className="text-slate-400 text-xl sm:text-3xl max-w-4xl mx-auto leading-relaxed font-medium">
              Verabschieden Sie sich von inkonsistenten KI-Outputs. Wir liefern <span className="text-white italic">Conception Engineering</span> — präzise Blueprints, die Agenten wie Cursor & Windsurf in Hochleistungsmaschinen verwandeln.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <button 
              onClick={onStart} 
              className="px-16 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_30px_100px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-5 group"
            >
              Start Free Blueprint
              <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button 
              onClick={() => onNavigate('features')}
              className="px-16 py-8 bg-white/5 hover:bg-white/10 text-slate-300 rounded-[2.5rem] font-black text-2xl border border-white/10 transition-all backdrop-blur-xl"
            >
              Explore Use Cases
            </button>
          </div>

          <div className="pt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-left animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
             {[
               { title: 'Semantic Blueprints', desc: 'Entwickeln Sie keine Dateien, sondern semantische Strukturen, die den Kontextverlust der KI eliminieren.', icon: '🏗️' },
               { title: 'Commercial ROI', desc: 'Erhalten Sie sofortige Kalkulationen für Token-Bedarf, API-Kosten und Entwicklungsdauer.', icon: '💰' },
               { title: 'Agentic Ready', desc: 'Unsere Master-Prompts sind speziell für die Reasoning-Modelle von morgen (o1, Gemini 2.5) optimiert.', icon: '🤖' }
             ].map((feature, i) => (
               <div key={i} className="glass p-12 rounded-[3.5rem] space-y-8 group hover:border-indigo-500/40 transition-all">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Trust & Proof Section */}
      <section className="py-40 border-y border-white/5 bg-slate-950/60 backdrop-blur-3xl">
         <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
            <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em]">The Conception Layer for modern Engineering</span>
            <div className="flex flex-wrap justify-center items-center gap-24 opacity-30 hover:opacity-100 transition-opacity duration-1000 grayscale hover:grayscale-0">
               <span className="text-4xl font-black text-white tracking-widest">CURSOR</span>
               <span className="text-4xl font-black text-white tracking-widest">WINDSURF</span>
               <span className="text-4xl font-black text-white tracking-widest">ANTHROPIC</span>
               <span className="text-4xl font-black text-white tracking-widest">GOOGLE CLOUD</span>
               <span className="text-4xl font-black text-white tracking-widest">VEO</span>
            </div>
         </div>
      </section>

      {/* The Problem & Solution Breakdown */}
      <section className="py-64 px-6 overflow-hidden">
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
               <div className="space-y-12">
                  <h2 className="text-7xl font-black text-white leading-[0.88] tracking-tighter">Warum Blueprint <br/> Engineering?</h2>
                  <p className="text-slate-400 text-2xl leading-relaxed">
                    AI-Modelle sind so gut wie ihr Kontext. Wenn Sie vage "Prompts" schreiben, raten die Modelle. Wenn Sie Blueprints liefern, <span className="text-white font-bold">konstruieren</span> sie.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                     {[
                       {t: '80% Weniger Halluzinationen', d: 'Durch strikte Architektur-Vorgaben.'},
                       {t: 'Echtzeit-Kostenkontrolle', d: 'Vorhersage von API-Gebühren.'},
                       {t: 'Zero-Context Loss', d: 'Strukturiert für Long-Context Fenster.'},
                       {t: 'Commercial Ready', d: 'Vollständige SWOT & Markt-Analyse.'}
                     ].map((item, i) => (
                       <div key={i} className="space-y-4">
                          <div className="flex items-center gap-3 text-indigo-400">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                             <span className="text-sm font-black uppercase tracking-widest">{item.t}</span>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="relative group">
                  <div className="absolute -inset-10 bg-indigo-600/20 blur-[150px] rounded-full group-hover:bg-indigo-600/30 transition-all duration-1000"></div>
                  <div className="glass p-2 bg-gradient-to-br from-white/10 to-transparent rounded-[4.5rem]">
                     <div className="bg-[#020617] p-16 rounded-[4.4rem] space-y-10 shadow-2xl">
                        <div className="flex gap-3">
                           <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                           <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                           <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                        </div>
                        <div className="space-y-6">
                           <div className="h-6 w-3/4 bg-slate-900 rounded-full animate-pulse"></div>
                           <div className="h-6 w-full bg-slate-900 rounded-full animate-pulse delay-75"></div>
                           <div className="h-56 w-full bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 gap-4">
                              <span className="text-indigo-400 font-mono text-[11px] uppercase tracking-widest">Synthesizing Architecture...</span>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-600 w-1/2 animate-[loading_2s_infinite]"></div>
                              </div>
                           </div>
                           <div className="h-6 w-1/2 bg-slate-900 rounded-full animate-pulse delay-150"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-20">
               {[
                  { title: "Architectural Clarity", desc: "No more disconnected code snippets. Every component knows its place in the system hierarchy." },
                  { title: "Cost Efficiency", desc: "Know exactly how many tokens your feature implementation will cost before hitting 'run'." },
                  { title: "Team Scalability", desc: "Unified conception language that makes it easy for teams to hand off AI-managed projects." }
               ].map((box, i) => (
                  <div key={i} className="glass p-12 rounded-[3.5rem] border-white/5 hover:border-indigo-500/20 transition-all">
                     <h4 className="text-xl font-bold text-white mb-4">{box.title}</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">{box.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* The Core Features List - Grid Section */}
      <section className="py-64 bg-slate-950/40 px-6">
         <div className="max-w-7xl mx-auto space-y-32">
            <div className="text-center space-y-8">
               <h2 className="text-7xl font-black text-white tracking-tighter">Everything you need to <br/> build the future.</h2>
               <p className="text-slate-400 text-xl max-w-2xl mx-auto">Vollständige Suite von Conception-Tools für professionelle Software-Architekten.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                  { icon: "🏗️", label: "Logic Mapping", text: "Automated entity & relationship mapping for bulletproof data structures." },
                  { icon: "💰", label: "ROI Analytics", text: "Commercial estimation of development hours, token usage, and API costs." },
                  { icon: "🔍", label: "Source Analysis", text: "Upload existing code or URLs to analyze competitors or legacy stacks." },
                  { icon: "🛡️", label: "Security Guardrails", text: "Built-in compliance and security requirements for fintech & medical apps." },
                  { icon: "🌍", label: "Global Reach", text: "i18n ready architectures with built-in localization strategies." },
                  { icon: "🚀", label: "One-Click Bundle", text: "Download full project bundles optimized for Cursor & Windsurf rules." },
                  { icon: "📈", label: "Growth Strategy", text: "Integrated marketing and monetization suggestions based on target audience." },
                  { icon: "🤖", label: "Model Agnostic", text: "Supports Claude 3.5, GPT-4o, and Gemini 2.5 architecture patterns." }
               ].map((feat, i) => (
                  <div key={i} className="glass p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/30 transition-all space-y-6">
                     <div className="text-4xl">{feat.icon}</div>
                     <h5 className="text-lg font-bold text-white tracking-tight">{feat.label}</h5>
                     <p className="text-slate-500 text-xs leading-relaxed">{feat.text}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final Conversion Section */}
      <section className="py-64 px-6">
         <div className="max-w-6xl mx-auto glass p-24 rounded-[5rem] text-center space-y-12 border-indigo-500/20 shadow-[0_0_150px_rgba(79,70,229,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px]"></div>
            
            <h2 className="text-7xl font-black text-white tracking-tighter relative z-10">Bereit für den <br/> nächsten Level?</h2>
            <p className="text-slate-400 text-2xl max-w-3xl mx-auto leading-relaxed relative z-10">
              Nutzen Sie unser Scoping-System, um Ihr nächstes Projekt nicht nur zu programmieren, sondern strategisch zu planen. Sparen Sie Tausende Euros an Fehlentwicklungen.
            </p>
            <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
               <button onClick={onStart} className="px-20 py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[3rem] font-black text-3xl shadow-[0_40px_120px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105 active:scale-95">
                 Get Started Free
               </button>
               <button 
                onClick={() => onNavigate('pricing')}
                className="px-20 py-10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-[3rem] font-black text-3xl border border-white/10 transition-all"
               >
                 View Plans
               </button>
            </div>
         </div>
      </section>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
