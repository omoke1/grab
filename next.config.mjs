/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/.well-known/miniapp.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300" },
          { key: "Content-Type", value: "application/json; charset=utf-8" },
        ],
      },
      {
        source: "/placeholder.jpg",
        headers: [
          { key: "Cache-Control", value: "public, immutable, no-transform, max-age=300" },
          { key: "Content-Type", value: "image/jpeg" },
        ],
      },
    ]
  },
}

export default nextConfig
