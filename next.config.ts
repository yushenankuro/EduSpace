import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
};

// next.config.js
module.exports = {
  images: {
    domains: ['images.unsplash.com'],
  },
}
export default nextConfig;
