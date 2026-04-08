'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export type PipelineStage = 'idle' | 'uploading' | 'vision' | 'research' | 'copy' | 'code' | 'qa' | 'ready' | 'error';

interface PipelineProgress {
  stage: string;
  status: 'running' | 'done' | 'error';
  message: string;
}

interface GenerationState {
  stage: PipelineStage;
  projectId: string | null;
  messages: string[];
  error: string | null;
}

/**
 * Hook that manages the real generation pipeline via SSE.
 * Replaces the fake setInterval-based animation.
 */
export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    stage: 'idle',
    projectId: null,
    messages: [],
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ stage: 'idle', projectId: null, messages: [], error: null });
  }, []);

  const generate = useCallback(async (
    file: File,
    businessName: string,
    niche: string,
    extraPrompt: string,
    mediaLinks: string,
    config: { visionModel: string; codeModel: string; searchEnabled: boolean },
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ stage: 'uploading', projectId: null, messages: ['Uploading screenshot...'], error: null });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessName', businessName);
    formData.append('niche', niche);
    formData.append('extraPrompt', extraPrompt);
    formData.append('mediaLinks', mediaLinks);
    formData.append('visionModel', config.visionModel);
    formData.append('codeModel', config.codeModel);
    formData.append('searchEnabled', String(config.searchEnabled));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        setState(prev => ({ ...prev, stage: 'error', error: err.error || 'Generation failed' }));
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        setState(prev => ({ ...prev, stage: 'error', error: 'No response stream' }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ') && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (eventType === 'started') {
                setState(prev => ({ ...prev, projectId: data.projectId }));
              } else if (eventType === 'progress') {
                const progress = data as PipelineProgress;
                setState(prev => ({
                  ...prev,
                  stage: progress.stage as PipelineStage,
                  messages: [...prev.messages, progress.message],
                }));
              } else if (eventType === 'complete') {
                setState(prev => ({ ...prev, stage: 'ready' }));
              } else if (eventType === 'error') {
                setState(prev => ({ ...prev, stage: 'error', error: data.error }));
              }
            } catch { /* skip malformed JSON */ }
            eventType = '';
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(prev => ({ ...prev, stage: 'error', error: err.message || 'Connection failed' }));
      }
    }
  }, []);

  return { ...state, generate, reset };
}
