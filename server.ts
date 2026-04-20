/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. API will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Data Mapping Utilities
const projectToDB = (p: any) => ({
  id: p.id,
  name: p.name,
  github_account: p.githubAccount,
  github_repo_url: p.githubRepoUrl,
  vercel_account: p.vercelAccount,
  supabase_project: p.supabaseProject,
  classification: p.classification,
  credentials: p.credentials,
  status: p.status,
  image_url: p.imageUrl,
  owner_id: p.ownerId,
  updated_at: new Date().toISOString()
});

const dbToProject = (p: any) => ({
  id: p.id,
  name: p.name,
  githubAccount: p.github_account,
  githubRepoUrl: p.github_repo_url,
  vercelAccount: p.vercel_account,
  supabaseProject: p.supabase_project,
  classification: p.classification,
  credentials: p.credentials,
  status: p.status,
  imageUrl: p.image_url,
  ownerId: p.owner_id,
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/projects', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data.map(dbToProject));
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ error: 'Error al leer los datos' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const dbData = projectToDB(req.body);
      // Let Supabase generate ID if not provided
      if (!dbData.id) delete (dbData as any).id;
      
      const { data, error } = await supabase
        .from('projects')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      res.json(dbToProject(data));
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ error: 'Error al guardar los datos' });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const dbData = projectToDB(req.body);
      const { data, error } = await supabase
        .from('projects')
        .update(dbData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(dbToProject(data));
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Error al actualizar los datos' });
    }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Error al eliminar los datos' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
