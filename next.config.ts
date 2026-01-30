import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },

  // Set turbopack root to current working directory (should be project root when running npm run dev)
  turbopack: {
    root: path.resolve("."),
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "sonner"],
  },
};

export default nextConfig;
