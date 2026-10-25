import type { NextConfig } from "next";

// Fully static export for Cloudflare Pages: `next build` writes the site to out/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
