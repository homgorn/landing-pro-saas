'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, RefreshCcw, Search } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalLines, setTotalLines] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?date=${date}&limit=300`);
      const data = await res.json();
      setLogs(data.entries || []);
      setTotalLines(data.totalLines || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter((log) =>
    log.message?.toLowerCase().includes(filter.toLowerCase()) ||
    log.level?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-[#0F0F0F] rounded-2xl border border-[#C8A96E1A] overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 border-b border-[#C8A96E1A] flex justify-between items-center bg-[#161616] gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Terminal size={16} className="text-[#C8A96E]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8A49B]">
            Logs ({totalLines})
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-[#080808] border border-[#C8A96E33] rounded-lg px-2 py-1.5 text-xs text-[#EDEBE5] outline-none"
          />
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              placeholder="Filter..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#080808] border border-[#C8A96E33] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[#EDEBE5] outline-none focus:border-[#C8A96E] w-36"
            />
          </div>
          <button
            onClick={fetchLogs}
            className={`p-1.5 rounded-lg border border-[#C8A96E33] text-[#555] hover:text-[#C8A96E] transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Log Lines */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] flex flex-col gap-0.5">
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[#333]">
            {loading ? 'Loading...' : 'No logs for this date'}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2 py-1 hover:bg-[#FFFFFF03] rounded px-1">
              <span className="text-[#333] shrink-0 w-[60px]">
                {log.timestamp?.includes('T')
                  ? log.timestamp.split('T')[1]?.split('.')[0] || ''
                  : log.timestamp?.split(' ')[1] || ''}
              </span>
              <span className={`uppercase font-bold shrink-0 w-[40px] ${
                log.level === 'error' ? 'text-red-500' :
                log.level === 'warn' ? 'text-yellow-500' :
                log.level === 'debug' ? 'text-[#555]' : 'text-blue-500'
              }`}>
                {log.level}
              </span>
              <span className="text-[#A8A49B] truncate">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
