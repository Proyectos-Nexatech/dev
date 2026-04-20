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
  const [filter, setFilter] = useState<'All' | 'Clientes' | 'Interno' | 'Demo' | 'Personal'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.classification === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-10">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 font-medium">Gestiona las identidades de tus proyectos en un solo lugar.</p>
        </div>
        <button 
          onClick={onAddProject}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Agregar Proyecto
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto px-4 border-r border-slate-100 mr-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar recursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-64 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto max-w-full">
          {(['All', 'Clientes', 'Interno', 'Demo', 'Personal'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'All' ? 'Todos' : f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-slate-100 pl-4 ml-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
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
      className="bg-white rounded-[32px] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 border border-slate-50 transition-all duration-500"
      onClick={onEdit}
    >
      {project.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={project.imageUrl} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      <div className="p-8 space-y-8">
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
              <div className={`w-2 h-2 rounded-full ${
                project.status === 'Activo' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                project.status === 'Pausado' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 
                'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
              }`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Stack Conectado</p>
          <div className="flex flex-wrap gap-2">
             <a href={project.githubRepoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" onClick={e => e.stopPropagation()}>
                <Github className="w-4 h-4" />
                <span className="text-xs font-semibold">Repositorio</span>
             </a>
             {project.vercelAccount && (
               <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600">
                 <Zap className="w-4 h-4 text-orange-400" />
                 <span className="text-xs font-semibold">Vercel</span>
               </div>
             )}
             {project.supabaseProject && (
               <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-600">
                 <Database className="w-4 h-4 text-emerald-400" />
                 <span className="text-xs font-semibold">Base de Datos</span>
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
