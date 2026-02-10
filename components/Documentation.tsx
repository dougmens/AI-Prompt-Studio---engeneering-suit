
import React from 'react';
import { Button } from './Button';

interface DocumentationProps {
  onBack: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ onBack }) => {
  const downloadMD = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const docs = {
    features: {
      title: "Core Features Overview",
      filename: "01_AI_STUDIO_FEATURES.md",
      content: `# AI Conception Studio: Feature Overview\n\n## 1. Blueprint Engineering\nTransformiert Visionen in präzise technische Spezifikationen.\n- **Logic Mapping:** Automatische Entitäten-Extraktion.\n- **Architecture Specs:** Definition von Tech-Stacks und Ordnerstrukturen.\n- **Synthesis:** Generierung von .cursorrules und Master-Prompts.\n\n## 2. Creative Lab (Media Synthesis)\n- **Image Generation:** 1K/2K/4K Mockups mit Gemini 3 Pro Image.\n- **Video Generation:** 7s Animationen mit Veo 3.1.\n- **Aspect Ratio Control:** Unterstützung für 1:1 bis 21:9.\n\n## 3. AI Architect Copilot\n- **Deep Reasoning:** 32.768 Thinking-Tokens für komplexe Abfragen.\n- **Google Search Grounding:** Echtzeit-Datenintegration für Marktanalysen.`
    },
    architecture: {
      title: "Architecture & Synthesis Protocol",
      filename: "02_ARCHITECTURE_SYNTHESIS.md",
      content: `# Technical Synthesis Protocol v4.0\n\n## Methodik\n1. **Extraction:** Analyse des User-Inputs via Gemini 3 Pro.\n2. **Structuring:** Erstellung eines Systemmodells (Stage 1).\n3. **Definition:** Festlegung der API-Endpunkte und Sicherheits-Guardrails (Stage 2).\n4. **Compilation:** Zusammenführung aller Daten in einen Master-Prompt für Agenten-IDEs wie Cursor (Stage 3).\n\n## Modell-Einsatz\n- **Logic & Planning:** gemini-3-flash-preview\n- **Refinement & Thinking:** gemini-3-pro-preview\n- **TTS:** gemini-2.5-flash-preview-tts`
    },
    roi: {
      title: "ROI & Commercial Scoping Guide",
      filename: "03_ROI_SCOPING_METHODOLOGY.md",
      content: `# ROI & Commercial Scoping Methodology\n\n## Kalkulationsfaktoren\n- **Effort Hours:** Basierend auf Komplexitäts-Indikatoren (CRUD vs. Realtime).\n- **Token Volume:** Schätzung des Kontext-Bedarfs pro Entwicklungsphase.\n- **AI Savings:** Vergleich zwischen Legacy-Entwicklung und AI-Augmented Engineering.\n\n## Kosten-Komponenten\n- **API-Budget:** Kalkulation für LLM-Aufrufe.\n- **Infrastructure:** Monatliche Hosting-Projektionen (Vercel/AWS/Hetzner).`
    },
    lab: {
      title: "Creative Lab Manual",
      filename: "04_CREATIVE_LAB_MANUAL.md",
      content: `# Creative Lab: Media Engine v4\n\n## Image Generation (Gemini 3 Pro Image)\n- **Modell:** gemini-3-pro-image-preview\n- **Features:** 4K Upscaling, Präzise Text-Rendering in Mockups.\n\n## Video Motion (Veo 3.1)\n- **Prozess:** Image-to-Video Workflow.\n- **Resolution:** 720p/1080p Cinematic Motion.\n- **Constraints:** 7 Sekunden High-Fidelity Output.`
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-24 pb-40 px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">System Documentation</h2>
          <p className="text-indigo-400 text-lg font-mono uppercase tracking-widest">Mastering the Conception Layer</p>
        </div>
        <Button variant="outline" onClick={onBack} size="lg" className="rounded-3xl">
          Zurück zum Studio
        </Button>
      </div>

      {/* Download Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-white tracking-tight">System Assets herunterladen</h3>
          <p className="text-slate-500 max-w-2xl mx-auto">Exportieren Sie alle technischen Details und Funktionsbeschreibungen als Markdown für Ihr internes Wissensmanagement oder Agent-Systeme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(docs).map(([key, doc]) => (
            <div key={key} className="glass p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/20 transition-all group flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-white">{doc.title}</h4>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{doc.filename}</p>
              </div>
              <Button 
                onClick={() => downloadMD(doc.filename, doc.content)} 
                variant="ghost" 
                className="mt-8 border border-white/5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"
              >
                Download Markdown
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Existing Documentation Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pt-12 border-t border-white/5">
        <div className="lg:col-span-4 sticky top-32 space-y-4">
           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Phase 01</span>
           <h3 className="text-3xl font-bold text-white tracking-tight">System Modeling</h3>
           <p className="text-slate-500 text-sm leading-relaxed">
             Der erste Schritt jeder KI-Entwicklung sollte nicht Code sein. Wir extrahieren die pure Logik: Entitäten, Relationen und Flows. Dies verhindert logische Halluzinationen in der KI.
           </p>
        </div>
        <div className="lg:col-span-8 glass p-10 rounded-[3rem] space-y-10 bg-slate-900/40">
           <div className="space-y-6">
              <h4 className="text-white font-bold text-xl">Struktur über Syntax</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                KI-Modelle tendieren dazu, den Weg des geringsten Widerstands zu gehen (Lazy Coding). Durch unsere Strukturvorgabe zwingen wir das Modell, die Architektur in den Vordergrund zu stellen.
              </p>
              <ul className="space-y-4 pt-4">
                 {[
                   'Identifikation von Kern-Daten-Modellen',
                   'Mapping von Abhängigkeiten',
                   'Simulation von User-Journey Verzweigungen',
                   'Logische Validierung der Business-Ziele'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {item}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </section>

      {/* ROI & Business */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-4 sticky top-32 space-y-4">
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Phase 02</span>
           <h3 className="text-3xl font-bold text-white tracking-tight">Economic Scoping</h3>
           <p className="text-slate-500 text-sm leading-relaxed">
             Ein Projekt ist nur erfolgreich, wenn es wirtschaftlich ist. Wir analysieren Kosten, Tokens und Zeitaufwand, bevor die erste Zeile Code geschrieben wird.
           </p>
        </div>
        <div className="lg:col-span-8 glass p-10 rounded-[3rem] space-y-10 bg-amber-500/5 border-amber-500/10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h5 className="text-amber-500 font-bold text-sm uppercase">Token Ökonomie</h5>
                 <p className="text-xs text-slate-400 leading-relaxed">Wir schätzen den Kontextverbrauch für das gesamte Projekt. Dies hilft bei der Auswahl des richtigen Modells (Cost vs. Performance).</p>
              </div>
              <div className="space-y-4">
                 <h5 className="text-emerald-500 font-bold text-sm uppercase">AI-Augmentation Faktor</h5>
                 <p className="text-xs text-slate-400 leading-relaxed">Wir berechnen den Zeitgewinn durch Agenten-Entwicklung im Vergleich zur manuellen Legacy-Entwicklung.</p>
              </div>
           </div>
        </div>
      </section>

      <div className="flex justify-center pt-20">
         <Button onClick={onBack} size="lg" className="px-20 py-8 text-2xl rounded-[3rem] shadow-indigo-500/30">
            Jetzt Blueprint erstellen
         </Button>
      </div>
    </div>
  );
};
