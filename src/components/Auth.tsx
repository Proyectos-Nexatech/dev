/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Github, Fingerprint, ArrowRight, Shield, Globe, Terminal } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] relative overflow-hidden transition-colors duration-300">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-[var(--bg-card)] rounded-3xl shadow-xl shadow-indigo-500/5 p-10 space-y-8 border border-[var(--border-subtle)] relative z-10 transition-colors">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-1 px-4 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--border-subtle)] mb-2 border border-[var(--border-subtle)]">
              <img src="/logo.png" alt="Nexatech Logo" className="h-12 w-auto object-contain dark:brightness-0 dark:invert" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">Proyectos Nexatech</h1>
              <p className="text-[var(--text-muted)] mt-1">Protocolo de Gestión v2.5</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Feature icon={<Globe className="w-4 h-4" />} label="Multi-Nube" />
            <Feature icon={<Terminal className="w-4 h-4" />} label="Enlaces Directos" />
          </div>

          <div className="space-y-4">
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
            >
              Iniciar sesión con Google
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest px-4">
              Acceso restringido. Solo personal autorizado de Nexatech.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] italic text-[var(--text-main)] text-sm">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
