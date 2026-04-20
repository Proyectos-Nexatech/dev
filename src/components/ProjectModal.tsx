/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { Project, DecryptedCredentials } from '../types';
import { encryptData, decryptData } from '../lib/encryption';
import { supabase } from '../lib/supabase';

interface ProjectModalProps {
  project: Partial<Project> | null;
  projects: Project[];
  masterKey: string;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

export default function ProjectModal({ project, projects, masterKey, onClose, onSave }: ProjectModalProps) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    githubAccount: '',
    githubRepoUrl: '',
    vercelAccount: '',
    supabaseProject: '',
    classification: 'Personal',
    status: 'Activo',
    imageUrl: '',
    ...(project || {})
  });

  // Extract unique existing accounts for the dropdown
  const existingAccounts = Array.from(new Set(projects.map(p => p.githubAccount).filter(Boolean)));

  const [creds, setCreds] = useState<DecryptedCredentials>({
    email: '',
    password: '',
    notes: ''
  });

  const [showCreds, setShowCreds] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen. Asegúrate de tener el bucket "project-images" configurado como público.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (project?.credentials && masterKey) {
      const decrypted = decryptData(project.credentials, masterKey);
      if (decrypted) {
        try {
          setCreds(JSON.parse(decrypted));
        } catch (e) {
          console.error("Failed to parse credentials", e);
        }
      }
    }
  }, [project, masterKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encryptedCreds = encryptData(JSON.stringify(creds), masterKey);
    onSave({
      ...formData,
      credentials: encryptedCreds
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border-subtle)]"
      >
        <div className="p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">{project?.id ? 'Editar Identidad' : 'Nueva Entrada de Identidad'}</h2>
              <p className="text-sm text-[var(--text-muted)] font-medium">Configura los metadatos del proyecto y los secretos de la bóveda.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[var(--bg-card)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all shadow-sm border border-[var(--border-subtle)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Project Details */}
            <div className="space-y-6">
              <InputGroup label="Nombre del Proyecto">
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all placeholder:text-[var(--text-muted)]/50"
                  placeholder="ej. Nexa Core API"
                />
              </InputGroup>

              <InputGroup label="Clasificación">
                <select
                  required
                  value={formData.classification}
                  onChange={e => setFormData({ ...formData, classification: e.target.value as any })}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Clientes">Clientes</option>
                  <option value="Interno">Interno</option>
                  <option value="Demo">Demo</option>
                  <option value="Personal">Personal</option>
                </select>
              </InputGroup>

              <InputGroup label="Asociación de GitHub">
                <input
                  required
                  list="github-accounts"
                  value={formData.githubAccount}
                  onChange={e => setFormData({ ...formData, githubAccount: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all"
                  placeholder="Selecciona o escribe un correo..."
                />
                <datalist id="github-accounts">
                  {existingAccounts.map(account => (
                    <option key={account} value={account} />
                  ))}
                </datalist>
              </InputGroup>

              <InputGroup label="URL del Repositorio">
                <input
                  type="url"
                  required
                  value={formData.githubRepoUrl}
                  onChange={e => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all"
                  placeholder="https://github.com/..."
                />
              </InputGroup>

              <InputGroup label="Imagen del Proyecto (Vista Previa)">
                <div className="space-y-4">
                  {formData.imageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                      >
                        Eliminar Imagen
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {uploading && <div className="text-[10px] font-bold text-indigo-500 uppercase animate-pulse">Subiendo imagen...</div>}
                </div>
              </InputGroup>
            </div>

            {/* Cloud & Credentials */}
            <div className="space-y-6">
               <InputGroup label="Identificadores de Plataforma">
                  <div className="space-y-3">
                    <input
                      value={formData.vercelAccount}
                      onChange={e => setFormData({ ...formData, vercelAccount: e.target.value })}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all placeholder:text-[var(--text-muted)]/50"
                      placeholder="Enlace Público de Vercel"
                    />
                    <input
                      value={formData.supabaseProject}
                      onChange={e => setFormData({ ...formData, supabaseProject: e.target.value })}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 ring-indigo-500 transition-all placeholder:text-[var(--text-muted)]/50"
                      placeholder="Correo de Supabase (Cuenta)"
                    />
                  </div>
               </InputGroup>

              <div className="bg-slate-900 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bóveda Segura</span>
                  </div>
                  <button type="button" onClick={() => setShowCreds(!showCreds)} className="text-slate-500 hover:text-white transition-colors">
                    {showCreds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type={showCreds ? "text" : "password"}
                    value={creds.email}
                    onChange={e => setCreds({ ...creds, email: e.target.value })}
                    className="w-full bg-white/5 border-none rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 focus:ring-1 ring-indigo-500/50"
                    placeholder="CORREO DE PRUEBA"
                  />
                  <input
                    type={showCreds ? "text" : "password"}
                    value={creds.password}
                    onChange={e => setCreds({ ...creds, password: e.target.value })}
                    className="w-full bg-white/5 border-none rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 focus:ring-1 ring-indigo-500/50"
                    placeholder="CONTRASEÑA DE PRUEBA"
                  />
                  <textarea
                    value={creds.notes}
                    onChange={e => setCreds({ ...creds, notes: e.target.value })}
                    className="w-full bg-white/5 border-none rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 focus:ring-1 ring-indigo-500/50 h-20 resize-none"
                    placeholder="NOTAS DE SEGURIDAD..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3 items-center">
            <div className="flex items-center gap-4 mr-auto p-2 px-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado de Identidad</span>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-sm animate-pulse ${
                    formData.status === 'Activo' ? 'bg-green-500 shadow-green-200' : 
                    formData.status === 'Pausado' ? 'bg-yellow-500 shadow-yellow-200' : 
                    'bg-red-500 shadow-red-200'
                  }`} />
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-600 uppercase tracking-widest focus:ring-0 cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Confirmar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">{label}</label>
      {children}
    </div>
  );
}
