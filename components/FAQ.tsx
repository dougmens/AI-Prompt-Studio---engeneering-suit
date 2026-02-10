
import React from 'react';
import { Button } from './Button';

interface FAQProps {
  onBack: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const faqs = [
    {
      q: "Was unterscheidet Blueprint Engineering von normalem Prompting?",
      a: "Beim normalen Prompting 'wünschen' Sie sich Code. Beim Blueprint Engineering liefern Sie der KI eine vollständige architektonische Spezifikation. Dies führt zu saubererem Code, weniger Bugs und einer deutlich besseren Skalierbarkeit, da die KI die Zusammenhänge zwischen den Modulen versteht."
    },
    {
      q: "Kann ich die Blueprints für alle Programmiersprachen nutzen?",
      a: "Ja. Unsere Pipeline ist sprach-agnostisch. Ob Sie in Python, Rust, TypeScript oder Go entwickeln möchten – die logische Modellierung bleibt die gleiche."
    },
    {
      q: "Wie genau sind die Kostenschätzungen?",
      a: "Die Schätzungen basieren auf Live-Benchmarks für Token-Verbrauch und aktuellen API-Preisen von OpenAI, Anthropic und Google. Sie dienen als Orientierungshilfe (+/- 15% Genauigkeit) für das kommerzielle Scoping."
    },
    {
      q: "Bietet ihr Support für Teams und Agenturen?",
      a: "Ja, in unserem Agency-Plan bieten wir Whitelabel-Exporte und spezielle Team-Workflows an, um Blueprints direkt in Agent-Pipelines zu integrieren."
    },
    {
      q: "Welche IDEs funktionieren am besten mit den Blueprints?",
      a: "Wir empfehlen 'Agent-First' IDEs wie Cursor, Windsurf oder PearAI. Diese können die mitgelieferten '.cursorrules' oder '.windsurfrules' direkt einlesen und so das gesamte Projektwissen sofort nutzbar machen."
    },
    {
      q: "Wie sicher sind meine Projektdaten?",
      a: "Wir speichern keine sensiblen Daten auf unseren Servern. Die Analyse findet lokal und über verschlüsselte API-Verbindungen statt. Blueprints werden nur in Ihrer lokalen Browser-Historie abgelegt."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-40 px-6 animate-in fade-in duration-700">
      <div className="text-center space-y-6 mb-20">
        <h2 className="text-5xl font-black text-white tracking-tighter">Häufige Fragen</h2>
        <p className="text-slate-400 text-lg">Alles, was Sie über professionelles Blueprinting wissen müssen.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {faqs.map((item, index) => (
          <div key={index} className="glass p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/20 transition-all group">
            <h4 className="text-xl font-bold text-white mb-4 flex items-start gap-4">
              <span className="text-indigo-500 font-black">Q:</span>
              {item.q}
            </h4>
            <div className="flex items-start gap-4">
              <span className="text-emerald-500 font-black">A:</span>
              <p className="text-slate-400 leading-relaxed text-sm">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600/10 border border-indigo-500/20 p-16 rounded-[4rem] text-center space-y-8 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
        <h3 className="text-3xl font-bold text-white">Noch Fragen offen?</h3>
        <p className="text-slate-400 max-w-xl mx-auto">Unser Expertenteam hilft Ihnen gerne dabei, Blueprint Engineering in Ihren Workflow zu integrieren.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
           <Button onClick={onBack} variant="primary" size="lg" className="rounded-2xl px-12">Jetzt starten</Button>
           <Button variant="outline" size="lg" className="rounded-2xl px-12">Kontakt aufnehmen</Button>
        </div>
      </div>
    </div>
  );
};
