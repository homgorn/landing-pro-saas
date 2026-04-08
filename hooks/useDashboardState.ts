import { useState } from 'react';
import { PipelineStage } from './useGeneration';

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'agents' | 'settings'>('dashboard');
  
  // Dashboard form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [mediaLinks, setMediaLinks] = useState('');

  const [visionModel, setVisionModel] = useState('gemini-3.1-flash');
  const [codeModel, setCodeModel] = useState('claude-3.5-sonnet');
  const [searchEnabled, setSearchEnabled] = useState(true);
  
  // Modal state
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setBusinessName('');
    setNiche('');
    setExtraPrompt('');
    setMediaLinks('');
  };

  const openPreview = (projectId: string, html: string) => {
    setPreviewProjectId(projectId);
    setPreviewHtml(html);
  };

  const closePreview = () => {
    setPreviewProjectId(null);
    setPreviewHtml(null);
  };

  return {
    // Navigation
    activeTab, setActiveTab,
    
    // Form Inputs
    selectedFile, setSelectedFile,
    businessName, setBusinessName,
    niche, setNiche,
    extraPrompt, setExtraPrompt,
    mediaLinks, setMediaLinks,
    visionModel, setVisionModel,
    codeModel, setCodeModel,
    searchEnabled, setSearchEnabled,
    resetForm,

    // Previews
    previewProjectId,
    previewHtml,
    openPreview,
    closePreview,
  };
}
