import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/aabhar',
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'radix-ui'],
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/aabhar/login",
        permanent: false,
        basePath: false,
      },
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
