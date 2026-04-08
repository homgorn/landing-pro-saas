import React from 'react';
import { LogViewer } from '../LogViewer';

export function AgentsTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Agent Fleet Diagnostics</h3>
        <p className="text-sm text-[#A8A49B]">Real-time system logs from Winston.</p>
      </div>
      <LogViewer />
    </div>
  );
}
