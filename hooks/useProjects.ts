'use client';

import { useState, useEffect, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  niche: string;
  status: string;
  deployedUrl: string | null;
  createdAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const deleteProject = useCallback(async (id: string) => {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    await refresh();
  }, [refresh]);

  return { projects, loading, refresh, deleteProject };
}
