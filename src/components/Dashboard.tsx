/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Plus, 
  LayoutGrid, 
  List, 
  Database, 
  Zap, 
  Search,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
}

export default function Dashboard({ projects, onAddProject, onEditProject }: DashboardProps) {
  const [filter, setFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(p => {
    const projectClass = p.classification || 'Personal';
    const matchesFilter = filter === 'Todos' || projectClass.toLowerCase() === filter.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-10">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-main)]">Panel de Control</h1>
          <p className="text-[var(--text-muted)] font-medium">Gestiona las identidades de tus proyectos en un solo lugar.</p>
        </div>
        <button 
          onClick={onAddProject}
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Agregar Proyecto
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-[var(--bg-card)] p-2 rounded-2xl shadow-sm border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 w-full md:w-auto px-4 border-r border-[var(--border-subtle)] mr-2">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-64 placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-app)] p-1 rounded-xl overflow-x-auto max-w-full border border-[var(--border-subtle)]">
          {(['Todos', 'Clientes', 'Interno', 'Demo', 'Personal']).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-4 ml-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-app)] text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[var(--bg-app)] text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
            >
              <List className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div 
          layout
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
            : "flex flex-col gap-4 pb-20"
          }
        >
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              viewMode={viewMode}
              onEdit={() => onEditProject(project)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
             <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium">No se encontraron proyectos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode, onEdit }) => {
  const isGrid = viewMode === 'grid';
  
  if (!isGrid) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer"
        onClick={onEdit}
      >
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            project.status === 'Activo' ? 'bg-green-500' : 
            project.status === 'Pausado' ? 'bg-yellow-500' : 'bg-red-500'
          } shadow-sm`} />
          <div>
            <h3 className="font-bold text-slate-800">{project.name}</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{project.githubAccount}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="hidden md:flex items-center gap-3">
              <PlatformBadge icon={<Github className="w-3 h-3" />} text="Repo" />
              {project.vercelAccount && <PlatformBadge icon={<Zap className="w-3 h-3 text-orange-400" />} text="Vercel" />}
              {project.supabaseProject && <PlatformBadge icon={<Database className="w-3 h-3 text-emerald-400" />} text="DB" />}
           </div>
           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="bg-[var(--bg-card)] rounded-[32px] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-yellow-500/10 border border-[var(--border-subtle)] transition-all duration-500 flex flex-col"
      onClick={onEdit}
    >
      <div className="relative h-48 w-full overflow-hidden bg-[var(--bg-app)]">
        {project.imageUrl ? (
          <>
            <img 
              src={project.imageUrl} 
              alt={project.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-app)] to-[var(--bg-card)] text-[var(--text-muted)]">
            <LayoutGrid className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Sin Vista Previa</span>
          </div>
        )}
        
        {/* Floating status indicator over image */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-full shadow-sm flex items-center gap-2 border border-white/10">
          <div className={`w-1.5 h-1.5 rounded-full ${
            project.status === 'Activo' ? 'bg-green-500' : 
            project.status === 'Pausado' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          <span className="text-[9px] font-bold text-[var(--text-main)] uppercase tracking-wider">{project.status}</span>
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                project.classification === 'Clientes' ? 'bg-orange-50 text-orange-600' : 
                project.classification === 'Interno' ? 'bg-blue-50 text-blue-600' : 
                project.classification === 'Demo' ? 'bg-purple-50 text-purple-600' : 
                'bg-emerald-50 text-emerald-600'
              }`}>
                {project.classification}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 bg-[var(--bg-app)] rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">Stack Conectado</p>
          <div className="flex flex-wrap gap-2">
             <a href={project.githubRepoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[var(--bg-app)] px-4 py-2 rounded-xl text-[var(--text-main)] hover:bg-[var(--border-subtle)] transition-colors" onClick={e => e.stopPropagation()}>
                <Github className="w-4 h-4" />
                <span className="text-xs font-semibold">Repositorio</span>
             </a>
             {project.vercelAccount && (
               <div className="flex items-center gap-2 bg-[var(--bg-app)] px-4 py-2 rounded-xl text-[var(--text-main)]">
                 <Zap className="w-4 h-4 text-orange-400" />
                 <span className="text-xs font-semibold">Vercel</span>
               </div>
             )}
             {project.supabaseProject && (
               <div className="flex items-center gap-2 bg-[var(--bg-app)] px-4 py-2 rounded-xl text-[var(--text-main)]">
                 <Database className="w-4 h-4 text-emerald-400" />
                 <span className="text-xs font-semibold">DB</span>
               </div>
             )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-300 group-hover:text-indigo-400 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Encriptado de Extremo a Extremo</span>
           </div>
           <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-xs font-bold text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
           >
             Ver Identidad
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function PlatformBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100">
      {icon}
      <span>{text}</span>
    </div>
  );
}
