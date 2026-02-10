
import React from 'react';
import { Button } from './Button';

interface PricingProps {
  onBack: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onBack }) => {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      desc: 'Für Solo-Entwickler & Prototypen',
      features: ['3 Blueprint-Generierungen', 'Standard Architektur-Export', 'Community Support', 'Local History'],
      btn: 'Kostenlos starten',
      highlight: false
    },
    {
      name: 'Professional',
      price: '29',
      desc: 'Für produktive Solo-Devs & Teams',
      features: ['Unbegrenzte Blueprints', 'Deep Strategy Analyse (SWOT)', 'Full Blueprint Bundles', 'Wirtschaftliche Kalkulation (ROI)', 'Priority Support'],
      btn: 'Pro testen',
      highlight: true
    },
    {
      name: 'Agency',
      price: '99',
      desc: 'Für Software-Agenturen',
      features: ['Whitelabel Exports', 'Team Collaboration', 'API-Zugriff für Workflows', 'Custom Compliance Checks', 'Dedicated Account Manager'],
      btn: 'Kontakt aufnehmen',
      highlight: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-48 pb-32 animate-in fade-in duration-700">
      <div className="text-center space-y-6 mb-24">
        <h2 className="text-5xl font-black text-white tracking-tighter">Faires Pricing für <br/> erstklassige Architektur.</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Wählen Sie den Plan, der am besten zu Ihrem Entwicklungstempo passt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, i) => (
          <div key={i} className={`glass p-10 rounded-[3rem] border-white/5 flex flex-col justify-between transition-all hover:translate-y-[-8px] ${plan.highlight ? 'border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.1)] relative' : ''}`}>
            {plan.highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Beliebtestes Paket</div>}
            <div className="space-y-8">
               <div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
               </div>
               <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">€{plan.price}</span>
                  <span className="text-slate-500 mb-2">/ Monat</span>
               </div>
               <div className="space-y-4 pt-8 border-t border-white/5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-xs text-slate-400">
                       <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                       {f}
                    </div>
                  ))}
               </div>
            </div>
            <div className="mt-12 pt-8">
               <Button variant={plan.highlight ? 'primary' : 'outline'} className="w-full py-4 rounded-2xl">{plan.btn}</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 glass rounded-[3rem] border-white/5 text-center space-y-6">
         <h4 className="text-2xl font-bold text-white">Sie brauchen ein individuelles Paket?</h4>
         <p className="text-slate-400 max-w-xl mx-auto">Für Enterprise-Integrationen und spezifische Tech-Stacks bieten wir maßgeschneiderte Lösungen an.</p>
         <button className="text-indigo-400 font-bold hover:text-indigo-300 transition-all">Sprechen Sie mit unserem Sales-Team &rarr;</button>
      </div>
    </div>
  );
};
