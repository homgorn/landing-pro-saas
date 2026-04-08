import React from 'react';
import { Box, Globe, Trash2 } from 'lucide-react';

interface ProjectsTabProps {
  projects: any[];
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectsTab({ projects, onPreview, onDelete }: ProjectsTabProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-[#A8A49B]">
        <Box size={48} className="mx-auto mb-4 text-[#262626]" />
        <p className="text-lg mb-2">No projects yet</p>
        <p className="text-sm">Upload a screenshot on the Dashboard to create your first landing page.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((p) => (
        <div key={p.id} className="bg-[#0F0F0F] rounded-2xl border border-[#C8A96E1A] p-6 hover:border-[#C8A96E4D] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#161616] rounded-lg flex items-center justify-center">
              <Globe size={18} className="text-[#C8A96E]" />
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
              p.status === 'ready' || p.status === 'deployed'
                ? 'bg-[#48C78E1A] text-[#48C78E]'
                : p.status === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-[#C8A96E0D] text-[#C8A96E]'
            }`}>{p.status}</span>
          </div>
          <h4 className="font-bold mb-1">{p.name}</h4>
          <p className="text-xs text-[#A8A49B] mb-4">{p.niche}</p>
          <div className="flex justify-between items-center text-[11px] text-[#A8A49B] pt-3 border-t border-[#FFFFFF05]">
            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
            <div className="flex gap-3">
              {p.status === 'ready' && (
                <button onClick={() => onPreview(p.id)} className="text-[#C8A96E] hover:underline font-bold">View</button>
              )}
              <button onClick={() => onDelete(p.id)} className="text-red-400/60 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
