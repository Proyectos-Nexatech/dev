/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProjectModal from './components/ProjectModal';
import MasterKeyModal from './components/MasterKeyModal';
import { Project } from './types';
import { Fingerprint, Database, Shield, Lock, Sun, Moon } from 'lucide-react';

// Firebase imports will be added after setup
// import { auth, db } from './firebase'; 

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [masterKey, setMasterKey] = useState<string | null>(localStorage.getItem('master_key'));
  const [activeModal, setActiveModal] = useState<Partial<Project> | 'new' | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    // Check local session
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      console.log('Proyectos recibidos:', data);
      setProjects(data);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  const handleLogin = () => {
    const mockUser = { uid: '00000000-0000-0000-0000-000000000000', email: 'admin@nexa.local' };
    localStorage.setItem('user_session', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    localStorage.removeItem('master_key');
    setUser(null);
    setMasterKey(null);
  };

  const handleMasterKeyConfirm = (key: string) => {
    setMasterKey(key);
    localStorage.setItem('master_key', key);
  };

  const handleSaveProject = async (data: Partial<Project>) => {
    if (!user || !masterKey) return;
    
    try {
      const url = data.id ? `/api/projects/${data.id}` : '/api/projects';
      const method = data.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ownerId: user.uid })
      });

      if (res.ok) {
        fetchProjects();
        setActiveModal(null);
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="space-y-6 text-center">
          <img src="/logo.png" alt="Logo Nexatech" className="w-32 h-auto mx-auto brightness-0 invert opacity-50" />
          <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.5em]">Iniciando archivo nexa...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!masterKey) {
    return <MasterKeyModal onConfirm={handleMasterKeyConfirm} />;
  }

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300`}>
      {/* Top Navbar */}
      <nav className="bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] sticky top-0 z-40 px-8 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1 px-3 bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-subtle)]">
             <img src="/logo.png" alt="Logo Nexatech" className={`h-8 w-auto object-contain ${isDark ? 'brightness-0 invert' : ''}`} />
          </div>
          <span className="font-bold text-[var(--text-main)] tracking-tight text-xl">Proyectos Nexatech</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:text-indigo-500 transition-all shadow-sm active:scale-95"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-none">Nodo Interno Activo</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <Dashboard 
          projects={projects} 
          onAddProject={() => setActiveModal('new')}
          onEditProject={(p) => setActiveModal(p)}
        />
      </main>

      {/* Modals */}
      {activeModal && (
        <ProjectModal 
          project={activeModal === 'new' ? null : activeModal as Project}
          projects={projects}
          masterKey={masterKey}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveProject}
        />
      )}

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[var(--bg-card)] border-t border-[var(--border-subtle)] py-3 px-8 flex justify-between items-center font-medium text-[10px] text-[var(--text-muted)] uppercase tracking-widest z-50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" /> Nexa OS v2.4.0</span>
          <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Bóveda AES-256 Activa</span>
        </div>
        <div className="flex items-center gap-2">
          Operador: <span className="text-[var(--text-main)] font-bold">{user.email}</span>
        </div>
      </div>
    </div>
  );
}
