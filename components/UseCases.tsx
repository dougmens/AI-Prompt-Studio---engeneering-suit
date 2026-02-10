
import React from 'react';
import { Button } from './Button';

interface UseCasesProps {
  onBack: () => void;
}

export const UseCases: React.FC<UseCasesProps> = ({ onBack }) => {
  const cases = [
    {
      title: "Solo SaaS Founder",
      icon: "🚀",
      description: "Transformiere eine vage Idee in 10 Minuten in einen vollständigen technischen Stack.",
      benefits: ["Fehlerfreie Datenmodelle von Anfang an", "Cursor-Ready Master-Prompts", "Integrierte Marketing-Strategie"],
      gradient: "from-blue-500/10 to-indigo-500/10"
    },
    {
      title: "Software Agency",
      icon: "🏢",
      description: "Beschleunige das Prototyping für Kunden und liefere hochwertige Architekturdokumentation.",
      benefits: ["Automatisierte API-Dokumentation", "ROI-Kalkulation für Angebote", "Team-übergreifende Blueprints"],
      gradient: "from-emerald-500/10 to-blue-500/10"
    },
    {
      title: "Enterprise Innovation",
      icon: "🛡️",
      description: "Sichere AI-Adoption durch strikte Einhaltung von Compliance und Security-Guardrails.",
      benefits: ["Integrierte DSGVO-Checks", "High-Security Architektur-Muster", "Klare technologische Leitplanken"],
      gradient: "from-purple-500/10 to-rose-500/10"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-40 space-y-32 animate-in fade-in duration-1000">
      <div className="text-center space-y-8 max-w-4xl mx-auto pt-20">
         <h2 className="text-6xl font-black text-white tracking-tighter leading-none">
           Entwickelt für die <br/>
           <span className="text-indigo-400">Architekten von morgen.</span>
         </h2>
         <p className="text-slate-400 text-xl leading-relaxed">
           Egal ob Sie alleine gründen oder ein globales Team leiten – Blueprint Engineering ist der Goldstandard für KI-native Softwareentwicklung.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cases.map((c, i) => (
          <div key={i} className={`glass p-12 rounded-[3.5rem] border-white/5 space-y-8 bg-gradient-to-br ${c.gradient}`}>
             <div className="text-5xl">{c.icon}</div>
             <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.description}</p>
             </div>
             <ul className="space-y-3">
                {c.benefits.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-xs text-slate-300">
                     <svg className="w-4 h-4 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                     {b}
                  </li>
                ))}
             </ul>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center border-y border-white/5 py-32">
         <div className="space-y-10">
            <h2 className="text-5xl font-black text-white leading-none tracking-tighter">Präzision statt Vermutung.</h2>
            <div className="space-y-8">
               <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 shrink-0">1</div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold text-white">Kontext-Stabilisierung</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Unsere Blueprints verhindern, dass die KI mitten im Projekt den Faden verliert. Alle Dateien sind semantisch verknüpft.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 shrink-0">2</div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold text-white">Technologische Objektivität</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Wir wählen den Stack basierend auf Ihren Zielen, nicht auf Trends. Jedes Framework wird begründet.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 flex items-center justify-center text-amber-400 shrink-0">3</div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold text-white">Wirtschaftliche Transparenz</h4>
                     <p className="text-slate-400 text-sm leading-relaxed">Keine bösen Überraschungen bei API-Rechnungen. Wir schätzen den Token-Bedarf pro Phase.</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="glass p-12 rounded-[4rem] border-white/10 space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative space-y-6">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Blueprint Output v4</span>
                  <div className="flex gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                     <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                     <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
               </div>
               <div className="p-6 bg-slate-950 rounded-3xl font-mono text-[10px] text-slate-500 space-y-2">
                  <p><span className="text-emerald-500">INIT</span> structure_mapping...</p>
                  <p><span className="text-indigo-500">CALC</span> token_burn_rate (est: 1.2M)...</p>
                  <p><span className="text-amber-500">WARN</span> context_window_limit_check...</p>
                  <p className="text-white pt-2">// Master Prompt generated successfully.</p>
               </div>
               <p className="text-xs text-slate-500 italic">"Der Unterschied zwischen einem Projekt, das nach 2 Wochen scheitert, und einem, das skaliert, liegt in der ersten Stunde der Planung."</p>
            </div>
         </div>
      </section>

      <div className="text-center pt-20">
         <Button onClick={onBack} size="lg" className="px-16 py-7 text-xl rounded-[2.5rem] shadow-indigo-500/40">
           Zurück zum Studio & Projekt starten
         </Button>
      </div>
    </div>
  );
};
