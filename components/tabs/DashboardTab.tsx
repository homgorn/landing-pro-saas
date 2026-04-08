import React from 'react';
import { Upload, Zap, Globe, Layers, Box, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { PipelineStage } from '../../hooks/useGeneration';

const PIPELINE_STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'vision', label: 'Vision Analysis' },
  { key: 'research', label: 'Research & Trends' },
  { key: 'copy', label: 'Copywriting' },
  { key: 'code', label: 'Code Generation' },
  { key: 'qa', label: 'QA & Compliance' },
];

const VISION_MODELS = [
  { value: 'gemini-3.1-flash', label: 'Gemini 3.1 Flash' },
  { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
  { value: 'gpt-4o', label: 'GPT-4o Vision' },
];

const CODE_MODELS = [
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
];

function stageStatus(currentStage: PipelineStage, target: PipelineStage): 'done' | 'active' | 'pending' {
  const order: PipelineStage[] = ['vision', 'research', 'copy', 'code', 'qa'];
  const ci = order.indexOf(currentStage);
  const ti = order.indexOf(target);
  if (ci < 0) return 'pending';
  if (ti < ci) return 'done';
  if (ti === ci) return 'active';
  return 'pending';
}

interface DashboardTabProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  businessName: string;
  setBusinessName: (val: string) => void;
  niche: string;
  setNiche: (val: string) => void;
  extraPrompt: string;
  setExtraPrompt: (val: string) => void;
  mediaLinks: string;
  setMediaLinks: (val: string) => void;
  visionModel: string;
  setVisionModel: (val: string) => void;
  codeModel: string;
  setCodeModel: (val: string) => void;
  searchEnabled: boolean;
  setSearchEnabled: (val: boolean) => void;
  isGenerating: boolean;
  genState: {
    stage: PipelineStage;
    error: string | null;
    messages: string[];
    projectId: string | null;
  };
  onGenerate: () => void;
  onPreview: (id: string) => void;
  onNew: () => void;
}

export function DashboardTab({
  selectedFile, setSelectedFile,
  businessName, setBusinessName,
  niche, setNiche,
  extraPrompt, setExtraPrompt,
  mediaLinks, setMediaLinks,
  visionModel, setVisionModel,
  codeModel, setCodeModel,
  searchEnabled, setSearchEnabled,
  isGenerating, genState,
  onGenerate, onPreview, onNew
}: DashboardTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Upload + Inputs */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-[#0F0F0F] rounded-2xl border border-[#C8A96E1A] p-8 text-center hover:border-[#C8A96E4D] transition-all relative min-h-[260px] flex flex-col items-center justify-center gap-4">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#161616] flex items-center justify-center border border-[#C8A96E1A]">
              <Upload className="text-[#C8A96E]" size={22} />
            </div>
            <div>
              <p className="font-semibold text-lg mb-1">
                {selectedFile ? selectedFile.name : 'Upload donor screenshot'}
              </p>
              <p className="text-[#A8A49B] text-xs">PNG, JPG, WEBP • Max 10MB</p>
            </div>
          </label>

          {selectedFile && genState.stage === 'idle' && (
            <button onClick={onGenerate} className="mt-2 px-8 py-3 bg-[#C8A96E] text-[#080808] rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#E2C99A] transition-all">
              <Play size={16} fill="currentColor" /> Generate Now
            </button>
          )}

          {genState.stage === 'ready' && (
            <div className="flex gap-3 mt-2">
              <button onClick={() => genState.projectId && onPreview(genState.projectId)} className="px-6 py-2.5 border border-[#C8A96E] text-[#C8A96E] rounded-lg font-bold text-sm">
                Preview
              </button>
              <button onClick={onNew} className="px-6 py-2.5 text-[#A8A49B] text-sm hover:text-[#EDEBE5]">
                + New
              </button>
            </div>
          )}

          {genState.error && <p className="text-red-400 text-sm mt-2">{genState.error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-5 focus-within:border-[#C8A96E4D]">
            <label className="text-[10px] uppercase tracking-widest text-[#A8A49B] block mb-1.5 font-bold">Business Name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Acme Corp / Your Brand" className="bg-transparent outline-none w-full text-sm placeholder-[#333]" />
          </div>
          <div className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-5 focus-within:border-[#C8A96E4D]">
            <label className="text-[10px] uppercase tracking-widest text-[#A8A49B] block mb-1.5 font-bold">Niche</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Ex: Personal Training / SaaS / Coffee" className="bg-transparent outline-none w-full text-sm placeholder-[#333]" />
          </div>
        </div>

        <div className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-5 focus-within:border-[#C8A96E4D]">
          <label className="text-[10px] uppercase tracking-widest text-[#A8A49B] block mb-1.5 font-bold">Additional Context & Content (Prompt)</label>
          <textarea 
            value={extraPrompt} 
            onChange={(e) => setExtraPrompt(e.target.value)} 
            placeholder="Describe your unique offer, features, pricing, or and specific instructions for the agent..." 
            className="bg-transparent outline-none w-full text-sm placeholder-[#333] resize-y min-h-[80px]" 
          />
        </div>

        <div className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-5 focus-within:border-[#C8A96E4D]">
          <label className="text-[10px] uppercase tracking-widest text-[#A8A49B] block mb-1.5 font-bold">Media URLs (Assets)</label>
          <textarea 
            value={mediaLinks} 
            onChange={(e) => setMediaLinks(e.target.value)} 
            placeholder="Links to YouTube videos, Vimeo, or direct Image URLs. One per line." 
            className="bg-transparent outline-none w-full text-sm placeholder-[#333] resize-y min-h-[80px]" 
          />
        </div>

        {isGenerating && (
          <div className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-5">
            <h4 className="text-xs uppercase tracking-widest text-[#A8A49B] mb-4 font-bold">Pipeline Progress</h4>
            <div className="flex flex-col gap-2">
              {PIPELINE_STAGES.map(({ key, label }) => {
                const s = stageStatus(genState.stage, key);
                return (
                  <div key={key} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${s === 'active' ? 'bg-[#C8A96E0D] border border-[#C8A96E33]' : 'border border-transparent'}`}>
                    {s === 'done' && <CheckCircle2 size={14} className="text-[#48C78E]" />}
                    {s === 'active' && <Zap size={14} className="text-[#C8A96E] animate-pulse" fill="currentColor" />}
                    {s === 'pending' && <Box size={14} className="text-[#262626]" />}
                    <span className={`text-sm ${s === 'pending' ? 'text-[#333]' : ''}`}>{label}</span>
                    {s === 'active' && <span className="ml-auto text-[10px] uppercase font-bold text-[#C8A96E]">Running...</span>}
                  </div>
                );
              })}
            </div>
            {genState.messages.length > 0 && (
              <p className="text-[11px] text-[#A8A49B] mt-3 border-t border-[#C8A96E0D] pt-3">
                {genState.messages[genState.messages.length - 1]}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Config Panel */}
      <div className="bg-[#0F0F0F] rounded-2xl border border-[#C8A96E1A] p-6 flex flex-col gap-5 h-fit">
        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-[#A8A49B]">
          <Layers size={16} className="text-[#C8A96E]" /> Pipeline Config
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#555]">Vision Model</label>
          <select value={visionModel} onChange={(e) => setVisionModel(e.target.value)} className="bg-[#080808] border border-[#C8A96E33] text-sm p-2.5 rounded-lg outline-none focus:border-[#C8A96E]">
            {VISION_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#555]">Code Engine</label>
          <select value={codeModel} onChange={(e) => setCodeModel(e.target.value)} className="bg-[#080808] border border-[#C8A96E33] text-sm p-2.5 rounded-lg outline-none focus:border-[#C8A96E]">
            {CODE_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#080808] border border-[#C8A96E1A] rounded-lg">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-[#C8A96E]" />
            <span className="text-xs">Brave Search</span>
          </div>
          <input type="checkbox" checked={searchEnabled} onChange={() => setSearchEnabled(!searchEnabled)} className="w-4 h-4 accent-[#C8A96E]" />
        </div>

        <div className="mt-auto p-3 rounded-lg bg-[#080808] border border-[#C8A96E0D]">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-[#C8A96E] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#A8A49B] leading-relaxed">
              {isGenerating
                ? `Processing: ${genState.stage}`
                : genState.stage === 'ready'
                  ? 'Generation complete!'
                  : 'Configure models and upload a screenshot.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
