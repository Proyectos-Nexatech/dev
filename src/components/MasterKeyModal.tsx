/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface MasterKeyModalProps {
  onConfirm: (key: string) => void;
}

export default function MasterKeyModal({ onConfirm }: MasterKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.length < 8) {
      setError('La Llave Maestra debe tener al menos 8 caracteres para un cifrado seguro.');
      return;
    }
    onConfirm(key);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full p-10 bg-white rounded-[40px] shadow-2xl flex flex-col items-center text-center space-y-8 border border-slate-100"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-[24px] shadow-xl shadow-indigo-200 flex items-center justify-center -mt-20 text-white transform rotate-6 hover:rotate-0 transition-transform duration-500">
          <Lock className="w-10 h-10" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Bóveda de Seguridad</h2>
          <p className="text-sm text-slate-500 font-medium px-4">
            Ingresa tu Frase Maestra para iniciar el motor de cifrado AES-256 y acceder a tus archivos.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 flex gap-4 text-left">
          <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-[11px] text-orange-800 font-semibold leading-relaxed">
            IMPORTANTE: Esta llave se procesa localmente y NUNCA se almacena. Si se pierde, tus datos cifrados no podrán recuperarse.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-3">
            <input
              autoFocus
              type="password"
              placeholder="••••••••••••"
              value={key}
              onChange={e => {
                setKey(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 rounded-2xl border-none px-6 py-5 text-center text-lg tracking-[0.4em] focus:ring-4 ring-indigo-100 transition-all font-bold placeholder:text-slate-200"
            />
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm shadow-xl shadow-indigo-100 group transition-all hover:bg-indigo-700 active:scale-95"
          >
            Desbloquear Archivos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
