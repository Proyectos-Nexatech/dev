/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  githubAccount: string;
  githubRepoUrl: string;
  vercelAccount: string;
  supabaseProject: string;
  classification: 'Clientes' | 'Interno' | 'Demo' | 'Personal';
  credentials: string; // AES Encrypted
  status: 'Activo' | 'Inactivo' | 'Pausado';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedCredentials {
  email?: string;
  password?: string;
  notes?: string;
}
