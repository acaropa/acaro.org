import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Static hosts resolve route folders through index.html on direct reloads.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
