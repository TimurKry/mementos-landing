import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/mementos-landing",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
