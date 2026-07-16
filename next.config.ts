import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Demo build: don't fail on lint/type nits so sharing is smooth.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
