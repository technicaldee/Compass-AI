/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },
  // Run on port 3001 to avoid conflict with backend
  async rewrites() {
    return []
  },
}

module.exports = nextConfig

