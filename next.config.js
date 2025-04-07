/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [];
  },
  server: {
    host: '0.0.0.0',
    port: 3002
  }
}

module.exports = nextConfig 