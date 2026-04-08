'use client';

import React, { useState, useCallback } from 'react';
import {
  Zap, Globe, Layout, Settings, Box, Terminal, X,
} from 'lucide-react';
import { useGeneration } from '../hooks/useGeneration';
import { useProjects } from '../hooks/useProjects';

import { DashboardTab } from '../components/tabs/DashboardTab';
import { ProjectsTab } from '../components/tabs/ProjectsTab';
import { AgentsTab } from '../components/tabs/AgentsTab';
import { SettingsTab } from '../components/tabs/SettingsTab';

import { useDashboardState } from '../hooks/useDashboardState';

export default function Dashboard() {
  const state = useDashboardState();
  const gen = useGeneration();
  const { projects, refresh: refreshProjects, deleteProject } = useProjects();

  const handleGenerate = useCallback(() => {
    if (!state.selectedFile) return;
    gen.generate(
      state.selectedFile, 
      state.businessName || 'Untitled', 
      state.niche || 'General', 
      state.extraPrompt,
      state.mediaLinks,
      {
        visionModel: state.visionModel,
        codeModel: state.codeModel,
        searchEnabled: state.searchEnabled,
      }
    );
  }, [state, gen]);

  const handlePreview = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects`);
      const data = await res.json();
      const proj = data.projects?.find((p: any) => p.id === projectId);
      if (proj?.generatedHtml) {
        state.openPreview(projectId, proj.generatedHtml);
      }
    } catch { /* ignore */ }
  }, [state]);

  const handleNewProject = useCallback(() => {
    gen.reset();
    state.resetForm();
    refreshProjects();
  }, [gen, state, refreshProjects]);

  const isGenerating = !['idle', 'ready', 'error'].includes(gen.stage);

  return (
    <div className="flex h-screen bg-[#080808] text-[#EDEBE5] overflow-hidden">
      <aside className="w-64 border-r border-[#C8A96E1A] bg-[#0F0F0F] p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C8A96E] rounded-md flex items-center justify-center">
            <Zap className="text-[#080808] w-5 h-5" fill="currentColor" />
          </div>
          <span className="font-semibold text-lg tracking-tight">LANDING PRO</span>
        </div>

        <nav className="flex flex-col gap-1">
          {([{ key: 'dashboard' as const, icon: Layout, label: 'Dashboard' },
            { key: 'projects' as const, icon: Box, label: 'Projects' },
            { key: 'agents' as const, icon: Terminal, label: 'Agents' },
            { key: 'settings' as const, icon: Settings, label: 'Settings' }
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => state.setActiveTab(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                state.activeTab === key
                  ? 'bg-[#C8A96E1A] text-[#C8A96E] border border-[#C8A96E33]'
                  : 'text-[#A8A49B] hover:text-[#EDEBE5] hover:bg-[#161616] border border-transparent'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-[#161616] rounded-xl border border-[#C8A96E1A]">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-[#C8A96E]" />
            <span className="text-xs uppercase tracking-widest text-[#A8A49B]">System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#48C78E] animate-pulse" />
            <span className="text-sm font-medium">Engine Online</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Universal Landing Constructor</h1>
            <p className="text-[#A8A49B] text-sm">Screenshot → AI Analysis → Production Landing Page</p>
          </div>
          <button
            onClick={handleNewProject}
            className="px-6 py-2.5 bg-[#C8A96E] text-[#080808] rounded-lg font-bold text-sm hover:shadow-[0_0_20px_rgba(200,169,110,0.3)] transition-all"
          >
            + New Project
          </button>
        </header>

        {state.activeTab === 'dashboard' && (
          <DashboardTab
            selectedFile={state.selectedFile} setSelectedFile={state.setSelectedFile}
            businessName={state.businessName} setBusinessName={state.setBusinessName}
            niche={state.niche} setNiche={state.setNiche}
            extraPrompt={state.extraPrompt} setExtraPrompt={state.setExtraPrompt}
            mediaLinks={state.mediaLinks} setMediaLinks={state.setMediaLinks}
            visionModel={state.visionModel} setVisionModel={state.setVisionModel}
            codeModel={state.codeModel} setCodeModel={state.setCodeModel}
            searchEnabled={state.searchEnabled} setSearchEnabled={state.setSearchEnabled}
            isGenerating={isGenerating}
            genState={{ stage: gen.stage, error: gen.error, messages: gen.messages, projectId: gen.projectId }}
            onGenerate={handleGenerate}
            onPreview={handlePreview}
            onNew={handleNewProject}
          />
        )}

        {state.activeTab === 'projects' && (
          <ProjectsTab projects={projects} onPreview={handlePreview} onDelete={deleteProject} />
        )}

        {state.activeTab === 'agents' && <AgentsTab />}

        {state.activeTab === 'settings' && <SettingsTab />}
      </main>

      {state.previewProjectId && state.previewHtml && (
        <div className="fixed inset-0 z-50 bg-[#000000CC] backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-[#0F0F0F] border border-[#C8A96E1A] rounded-2xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#C8A96E1A] flex justify-between items-center bg-[#161616]">
              <h3 className="font-bold">Site Preview</h3>
              <button
                onClick={() => state.closePreview()}
                className="p-2 hover:bg-[#080808] rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              srcDoc={state.previewHtml}
              className="flex-1 w-full bg-white"
              sandbox="allow-scripts"
              title="Generated Landing Page Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
