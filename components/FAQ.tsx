
import React from 'react';
import { Button } from './Button';

interface FAQProps {
  onBack: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const faqs = [
    {
      q: "Was genau ist ein 'Master-Prompt'?",
      a: "Ein Master-Prompt ist eine hochverdichtete, strukturierte Anweisung, die alle technischen Details, die Geschäftslogik und die Architekturvorgaben enthält. Er ist darauf optimiert, von KI-Agenten wie Claude 3.5 oder GPT-4o gelesen zu werden, um ein komplettes Projekt ohne Rückfragen zu starten."
    },
    {
      q: "Welche KI-Modelle werden verwendet?",
      a: "Wir nutzen eine Kombination aus Gemini 3 Flash für schnelle Strukturanalysen und Gemini 3 Pro (mit Deep Reasoning/Thinking) für die finale Synthese des Master-Prompts."
    },
    {
      q: "Kann ich den generierten Code direkt ausführen?",
      a: "Das Studio generiert keinen Code direkt, sondern die perfekte Anleitung für eine Programmier-KI. Kopieren Sie den Master-Prompt einfach in Ihren bevorzugten KI-Editor (z.B. Cursor, Windsurf) oder Chat."
    },
    {
      q: "Werden meine Projektdaten gespeichert?",
      a: "In der aktuellen Version werden keine Daten dauerhaft auf unseren Servern gespeichert. Sobald Sie die Seite neu laden, werden die lokalen Zustände zurückgesetzt."
    },
    {
      q: "Wie detailliert sollte meine Beschreibung sein?",
      a: "Je detaillierter, desto besser. Geben Sie konkrete Anwendungsfälle, Benutzerrollen und technische Präferenzen an, um die bestmögliche Architektur zu erhalten."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Häufig gestellte Fragen (FAQ)</h2>
          <p className="text-slate-400 mt-1">Alles, was Sie über das Studio wissen müssen</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Zurück zum Studio
        </Button>
      </div>

      <div className="space-y-6">
        {faqs.map((item, index) => (
          <div key={index} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
            <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-start gap-3">
              <span className="opacity-50">Q:</span>
              {item.q}
            </h4>
            <p className="text-slate-300 leading-relaxed flex items-start gap-3">
              <span className="opacity-50 font-bold text-emerald-500">A:</span>
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">Haben Sie weitere Fragen?</h3>
        <p className="text-slate-400 mb-6">Unser System lernt ständig dazu. Nutzen Sie die Dokumentation für tiefere Einblicke.</p>
        <Button onClick={onBack} variant="primary">
          Zurück zum Dashboard
        </Button>
      </div>
    </div>
  );
};
