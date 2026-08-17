import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the development manifest isolated from production builds. Running
  // `next build` while `next dev` is active must not invalidate the dev server.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  turbopack: {
    // This repository has another lockfile at its root; the app itself lives here.
    root: process.cwd(),
  },
  output: 'export',
  // Static hosts resolve route folders through index.html on direct reloads.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
