import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages. On Pages the site lives under /<repo>, which the deploy
 * workflow supplies through NEXT_PUBLIC_BASE_PATH. Locally it is empty, so `npm run dev` is unchanged.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};
export default nextConfig;
