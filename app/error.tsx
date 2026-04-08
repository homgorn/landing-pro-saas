'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#080808] text-[#EDEBE5]">
      <div className="flex flex-col items-center bg-[#0F0F0F] border border-[#C8A96E1A] p-10 rounded-2xl max-w-md text-center">
        <AlertCircle size={48} className="text-red-500 mb-6" />
        <h2 className="text-xl font-bold mb-3">Something went wrong!</h2>
        <p className="text-[#A8A49B] text-sm mb-8">
          A critical error occurred while rendering the page. Our systems have logged the issue.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#C8A96E] text-[#080808] font-bold text-sm rounded-lg hover:bg-[#E2C99A] transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
