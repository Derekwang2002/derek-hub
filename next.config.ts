import type { NextConfig } from "next";

const deploymentId = [
  process.env.NEXT_DEPLOYMENT_ID,
  process.env.VERCEL_DEPLOYMENT_ID,
  process.env.VERCEL_GIT_COMMIT_SHA,
  process.env.GITHUB_SHA
].find((value) => value?.trim());

const nextConfig: NextConfig = {
  ...(deploymentId ? { deploymentId: deploymentId.trim() } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/dev-test-uat-prod/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "sandbox allow-scripts; default-src 'none'; img-src data: blob: https:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'"
          },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      },
      {
        source: "/private/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }
        ]
      },
      {
        source: "/projects/:project/source-atlas/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  },
  experimental: {
    devtoolSegmentExplorer: false,
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        chunkIds: "named"
      };
    }

    return config;
  }
};

export default nextConfig;
