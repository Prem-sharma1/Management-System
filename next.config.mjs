/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb',
    },
  },
};

export default nextConfig; // trigger reload
// Force restart to fix Next.js API route 404 caching issue
