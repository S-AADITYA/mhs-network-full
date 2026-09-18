import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: { staleTimes: { dynamic: 30 } },
};

export default nextConfig;
