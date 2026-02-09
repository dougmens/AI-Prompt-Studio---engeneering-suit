
import React from 'react';
import { Button } from './Button';

interface DocumentationProps {
  onBack: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Dokumentation</h2>
          <p className="text-slate-400 mt-1">Verstehen Sie den Prompt-Engineering-Prozess</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Zurück zum Studio
        </Button>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-semibold text-blue-400">Über das Studio</h3>
        <p className="text-slate-300 leading-relaxed">
          Das AI Prompt Engineering Studio ist ein spezialisiertes Werkzeug für Software-Architekten und Entwickler. 
          Es automatisiert den mühsamen Prozess der Erstellung hochpräziser "Master-Prompts" für KI-Programmieragenten. 
          Anstatt einer KI nur eine vage Idee zu geben, liefert dieses Studio eine vollständige technische Spezifikation.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="text-blue-500 font-bold text-4xl mb-4">01</div>
          <h4 className="text-white font-bold mb-2">Logische Modellierung</h4>
          <p className="text-slate-400 text-sm">
            In der ersten Phase extrahiert die KI die Kern-Entitäten und deren Beziehungen. 
            Es entsteht ein abstrakter "Blaupausen"-Plan Ihres Systems, unabhängig von Code.
          </p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="text-indigo-500 font-bold text-4xl mb-4">02</div>
          <h4 className="text-white font-bold mb-2">Technische Architektur</h4>
          <p className="text-slate-400 text-sm">
            Hier wird die Logik in die Realität übersetzt. Die Pipeline wählt passende Stacks, 
            definiert API-Endpunkte und entwirft eine saubere Ordnerstruktur.
          </p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="text-emerald-500 font-bold text-4xl mb-4">03</div>
          <h4 className="text-white font-bold mb-2">Master-Prompt</h4>
          <p className="text-slate-400 text-sm">
            Die finale Stufe kompiliert alles in ein Format, das von Agenten wie Claude 3.5 Sonnet 
            oder GPT-4o optimal verarbeitet werden kann.
          </p>
        </div>
      </div>

      <section className="space-y-6 bg-slate-800/30 p-8 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.343 14.757a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM5.243 14.757a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414z" />
          </svg>
          Best Practices für Eingaben
        </h3>
        <ul className="space-y-4 text-slate-300">
          <li className="flex gap-3">
            <span className="text-blue-500 font-bold">•</span>
            <div>
              <strong className="text-white block">Präzise Problembeschreibung:</strong>
              Vermeiden Sie allgemeine Sätze. Beschreiben Sie genau, für wen das System ist und welchen Schmerzpunkt es löst.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-500 font-bold">•</span>
            <div>
              <strong className="text-white block">Funktionen einzeln auflisten:</strong>
              Nutzen Sie das "Funktion hinzufügen" Feld für jede eigenständige Logik-Einheit.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-500 font-bold">•</span>
            <div>
              <strong className="text-white block">Zielgruppe definieren:</strong>
              Die KI passt Sicherheitsanforderungen und Tech-Stack an die Zielgruppe an (z.B. Enterprise vs. Prototyp).
            </div>
          </li>
        </ul>
      </section>

      <section className="pt-10 border-t border-slate-800">
        <h3 className="text-lg font-semibold text-slate-400 mb-4 uppercase tracking-widest">Technologie</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
          <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Pipeline Engine:</span>
            <span className="text-white">Gemini 3 Flash</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-slate-400">Synthesis Engine:</span>
            <span className="text-white">Gemini 3 Pro</span>
          </div>
        </div>
      </section>
      
      <div className="flex justify-center pt-10">
        <Button onClick={onBack} size="lg" className="px-12">
          Jetzt starten
        </Button>
      </div>
    </div>
  );
};
