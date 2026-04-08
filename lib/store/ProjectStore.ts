// =============================================================
// Project Store — JSON-file based persistence
// =============================================================
import fs from 'fs/promises';
import path from 'path';
import logger from '../logger';

export type ProjectStatus = 'draft' | 'generating' | 'ready' | 'deployed' | 'error';

export interface Project {
  id: string;
  name: string;
  niche: string;
  status: ProjectStatus;
  screenshotPath: string | null;
  generatedHtml: string | null;
  deployedUrl: string | null;
  pipelineConfig: {
    visionModel: string;
    codeModel: string;
    searchEnabled: boolean;
    extraPrompt?: string;
    mediaLinks?: string;
  };
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readAll(): Promise<Project[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAll(projects: Project[]) {
  await ensureDataDir();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

export const ProjectStore = {
  async list(): Promise<Project[]> {
    return readAll();
  },

  async get(id: string): Promise<Project | null> {
    const all = await readAll();
    return all.find((p) => p.id === id) ?? null;
  },

  async create(data: Pick<Project, 'id' | 'name' | 'niche' | 'pipelineConfig'>): Promise<Project> {
    const all = await readAll();
    const project: Project = {
      ...data,
      status: 'draft',
      screenshotPath: null,
      generatedHtml: null,
      deployedUrl: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(project);
    await writeAll(all);
    logger.info('Project created', { id: project.id, name: project.name });
    return project;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const all = await readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    await writeAll(all);
    return all[idx];
  },

  async delete(id: string): Promise<boolean> {
    const all = await readAll();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    await writeAll(filtered);
    logger.info('Project deleted', { id });
    return true;
  },
};
