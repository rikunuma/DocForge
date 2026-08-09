import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiHost = process.env.INTERNAL_API_URL || "http://api:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiHost}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
