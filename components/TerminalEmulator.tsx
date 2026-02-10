
import React, { useState, useRef, useEffect } from 'react';
import { PipelineResult, ProjectData, WorkspaceFile } from '../types';

interface TerminalEmulatorProps {
  result: PipelineResult;
  projectData: ProjectData;
  onOpenRefinement: (target: string) => void;
}

export const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({ result, projectData, onOpenRefinement }) => {
  const [history, setHistory] = useState<string[]>(['Willkommen beim Agent-CLI v3.0.0', 'Tippe "help" für eine Liste der Befehle.']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = result.stage3?.workspaceFiles || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...history, `> ${input}`];
    const args = cmd.split(' ');
    const baseCmd = args[0];

    switch (baseCmd) {
      case 'help':
        newHistory.push(
          'Verfügbare Befehle:',
          '  ls              - Listet Workspace-Dateien auf',
          '  cat [file]      - Zeigt Dateiinhalt an',
          '  inspect [file]  - Startet Refinement-Analyse',
          '  export          - Kopiert Master-Prompt',
          '  status          - Zeigt Projekt-Metadaten',
          '  clear           - Leert das Terminal'
        );
        break;
      case 'ls':
        newHistory.push('Workspace Files:', ...files.map(f => `  ${f.name} (${f.language})`));
        break;
      case 'cat':
        const fileName = args[1];
        const file = files.find(f => f.name.toLowerCase() === fileName?.toLowerCase());
        if (file) {
          newHistory.push(`--- ${file.name} ---`, file.content, '------------------');
        } else {
          newHistory.push(`Fehler: Datei "${fileName}" nicht gefunden.`);
        }
        break;
      case 'inspect':
        const target = args[1];
        if (target) {
          onOpenRefinement(`CLI Inspect: ${target}`);
          newHistory.push(`Inspektor für "${target}" gestartet...`);
        } else {
          newHistory.push('Fehler: Bitte ein Ziel angeben (z.B. inspect .cursorrules)');
        }
        break;
      case 'export':
        navigator.clipboard.writeText(result.stage3?.masterPrompt || '');
        newHistory.push('ERFOLG: Master-Prompt in Zwischenablage kopiert.');
        break;
      case 'status':
        newHistory.push(
          `Projekt: ${projectData.title}`,
          `Umfang: ${projectData.projectScope}`,
          `Komplexität: ${projectData.complexity}`,
          `IDE: ${projectData.ide}`,
          `Modell: ${projectData.preferredModel}`
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        newHistory.push(`Unbekannter Befehl: ${baseCmd}. Tippe "help".`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div 
      className="flex-1 bg-black/90 p-6 mono text-xs leading-relaxed text-emerald-500/90 overflow-hidden flex flex-col cursor-text h-full"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide pb-4">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.startsWith('>') ? (
              <span className="text-indigo-400 font-bold">{line}</span>
            ) : line.startsWith('Fehler') ? (
              <span className="text-rose-500">{line}</span>
            ) : line.startsWith('ERFOLG') ? (
              <span className="text-emerald-400 font-bold">{line}</span>
            ) : (
              line
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="flex items-center gap-3 border-t border-emerald-500/20 pt-4">
        <span className="text-indigo-500 font-black animate-pulse">agent@studio:~$</span>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-emerald-400 caret-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};
