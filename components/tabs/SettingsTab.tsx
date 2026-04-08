import React from 'react';
import { Key, Database } from 'lucide-react';

export function SettingsTab() {
  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Key size={18} className="text-[#C8A96E]" /> API Keys
        </h3>
        <p className="text-xs text-[#A8A49B] mb-4">
          API keys are set via <code className="bg-[#161616] px-1.5 py-0.5 rounded text-[#C8A96E]">.env.local</code> file on the server.
          This is more secure than storing them in the browser.
        </p>
        <div className="space-y-3">
          {['GOOGLE_API_KEY', 'OPENROUTER_API_KEY', 'BRAVE_SEARCH_API_KEY'].map((key) => (
            <div key={key} className="bg-[#0F0F0F] rounded-xl border border-[#C8A96E1A] p-4 flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold text-[#A8A49B] font-mono">{key}</span>
              <span className="ml-auto text-[11px] text-[#333]">Server-side only</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500/80">
          <Database size={18} /> Danger Zone
        </h3>
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
          <p className="text-xs text-[#A8A49B] mb-3">Clear all generated projects and cached data.</p>
          <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded font-bold text-xs hover:bg-red-500/20 transition-all">
            Clear All Data
          </button>
        </div>
      </section>
    </div>
  );
}
