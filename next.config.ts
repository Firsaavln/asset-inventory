import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // 🔥 SAKTI: Kita dongkrak limitnya jadi 10 Megabyte bray!
    },
  },
};

export default nextConfig;


