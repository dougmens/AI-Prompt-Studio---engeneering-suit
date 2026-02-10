
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { ProjectData } from '../types';
import { decodeAudio, decodeAudioData, createBlobFromFloats } from '../services/audioUtils';
import { Button } from './Button';

interface VoiceScopingProps {
  onUpdateField: (field: keyof ProjectData, value: any) => void;
  onClose: () => void;
  currentData: Partial<ProjectData>;
}

export const VoiceScoping: React.FC<VoiceScopingProps> = ({ onUpdateField, onClose, currentData }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Verbinde mit Architekt-KI...');
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Du bist ein Senior Software Architekt. Deine Aufgabe ist es, den User interaktiv durch das Scoping seines Projekts zu führen.
          Frage nach: Titel, Beschreibung, Zielgruppe, Features, Scope, Komplexität, IDE, Modell, Github, Hosting, Test-Strategie und Security.
          Nutze die Funktion 'update_field', um erkannte Daten sofort im UI zu speichern. 
          Sei professionell, präzise und stelle kluge Rückfragen, wenn Anforderungen unklar sind.
          Beginne damit, den User zu begrüßen und zu fragen, was er heute bauen möchte.`,
          tools: [{
            functionDeclarations: [{
              name: 'update_field',
              description: 'Aktualisiert ein spezifisches Feld in der Projektkonfiguration.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  field: { 
                    type: Type.STRING, 
                    description: 'Der Name des Feldes (z.B. title, description, complexity, etc.)' 
                  },
                  value: { 
                    type: Type.STRING, 
                    description: 'Der extrahierte Wert für das Feld.' 
                  }
                },
                required: ['field', 'value']
              }
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            setStatus('KI Architekt ist online. Sprechen Sie jetzt.');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlobFromFloats(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Function Calls (Field Updates)
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'update_field') {
                  const { field, value } = fc.args as any;
                  onUpdateField(field as keyof ProjectData, value);
                  
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                  }));
                }
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setStatus('Verbindung beendet.'),
          onerror: (e) => {
            console.error(e);
            setStatus('Fehler in der Sprachverbindung.');
          }
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (err) {
      console.error(err);
      setStatus('Mikrofon-Zugriff verweigert oder technischer Fehler.');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    setIsActive(false);
    setIsListening(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass w-full max-w-xl p-10 rounded-[3rem] border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] text-center space-y-8">
        <div className="relative mx-auto w-32 h-32">
          <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-2xl transition-all duration-500 ${isListening ? 'opacity-40 scale-125' : 'opacity-10 scale-100'}`}></div>
          <div className={`relative w-full h-full bg-slate-900 rounded-full border-4 border-indigo-500/50 flex items-center justify-center overflow-hidden ${isListening ? 'animate-pulse' : ''}`}>
             <svg className={`w-12 h-12 ${isListening ? 'text-indigo-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V3a3 3 0 013-3z" />
             </svg>
             {isListening && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-full h-1 bg-indigo-500/20 animate-[wave_1.5s_infinite]"></div>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white tracking-tight">KI-Architekt im Live-Call</h3>
          <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest animate-pulse">{status}</p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-left">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Live-Erfassung:</h4>
           <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Titel:</span>
                <span className="text-slate-300 font-bold truncate ml-2">{currentData.title || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Scope:</span>
                <span className="text-slate-300 font-bold ml-2">{currentData.projectScope || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">Komp.:</span>
                <span className="text-slate-300 font-bold ml-2">{currentData.complexity || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-500">IDE:</span>
                <span className="text-slate-300 font-bold ml-2">{currentData.ide || '-'}</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={stopSession} variant="primary" size="lg" className="w-full shadow-indigo-500/40">
            Sprach-Modus beenden & Fortfahren
          </Button>
          <p className="text-slate-500 text-[10px]">Die KI übernimmt Ihre gesprochenen Anforderungen direkt in das Setup.</p>
        </div>
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); opacity: 0.2; }
          50% { transform: scaleY(5); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
