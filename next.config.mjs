/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gloria runs as a dynamic Node server (Render web service), not a static export.
  // Do NOT add `output: "export"` here: the /api routes need a live Node runtime.
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Mongoose is a Node-only dependency. Keep it out of the bundler so
  // server route handlers can use it reliably in production.
  serverExternalPackages: ["mongoose"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/**",
      },
    ],
  },

  // The app exposes its own API under /api. Allow other clients (mobile apps,
  // scripts) to consume it and make sure responses are never statically cached.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
