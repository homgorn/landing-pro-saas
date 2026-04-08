import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#080808] text-[#EDEBE5]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#C8A96E] rounded-xl flex items-center justify-center animate-pulse">
          <Zap className="text-[#080808] w-6 h-6" fill="currentColor" />
        </div>
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-[#A8A49B] animate-pulse">
        Initializing Engine...
      </p>
    </div>
  );
}
