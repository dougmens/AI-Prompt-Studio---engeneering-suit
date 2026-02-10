
import React, { useState, useMemo } from 'react';
import { SavedProject } from '../types';
import { Button } from './Button';

interface SavedProjectsListProps {
  projects: SavedProject[];
  onSelect: (project: SavedProject) => void;
  onDelete: (id: string) => void;
}

export const SavedProjectsList: React.FC<SavedProjectsListProps> = ({ projects, onSelect, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Extract all unique frontend/backend/database names for filtering
  const techFilters = useMemo(() => {
    const filters = new Set<string>();
    projects.forEach(p => {
      p.result.stage2?.techStack.frontend.forEach(t => filters.add(t.name));
      p.result.stage2?.techStack.backend.forEach(t => filters.add(t.name));
      p.result.stage2?.techStack.database.forEach(t => filters.add(t.name));
    });
    return Array.from(filters).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.data.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTech = !activeFilter || [
        ...(p.result.stage2?.techStack.frontend.map(t => t.name) || []),
        ...(p.result.stage2?.techStack.backend.map(t => t.name) || []),
        ...(p.result.stage2?.techStack.database.map(t => t.name) || [])
      ].includes(activeFilter);

      return matchesSearch && matchesTech;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [projects, searchQuery, activeFilter]);

  if (projects.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Projekt-Historie
        </h3>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Projekte durchsuchen..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {techFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!activeFilter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Alle
          </button>
          {techFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div 
            key={project.id}
            className="glass group p-6 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(project.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                  className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h4 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-400 transition-colors">{project.data.title}</h4>
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">{project.data.description}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.result.stage2?.techStack.frontend.slice(0, 1).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase rounded border border-indigo-500/20">{t.name}</span>
                ))}
                {project.result.stage2?.techStack.backend.slice(0, 1).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase rounded border border-emerald-500/20">{t.name}</span>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-[10px] py-2"
              onClick={() => onSelect(project)}
            >
              Architektur öffnen
            </Button>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-slate-800">
            <p className="text-slate-500 text-sm">Keine Projekte gefunden, die Ihren Kriterien entsprechen.</p>
          </div>
        )}
      </div>
    </div>
  );
};
