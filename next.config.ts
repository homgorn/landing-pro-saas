import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Needed for server-side file I/O (ProjectStore, Logs)
  serverExternalPackages: ['winston', 'winston-daily-rotate-file'],
};

export default nextConfig;
