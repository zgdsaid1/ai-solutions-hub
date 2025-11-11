/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'ai-solutions-hub',
  },
}

module.exports = nextConfig