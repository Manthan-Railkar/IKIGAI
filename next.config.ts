import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/api/detect",
        destination: "http://localhost:8000/detect",
      },
    ];
  },
};

export default nextConfig;
