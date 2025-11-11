/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    CUSTOM_KEY: 'ai-solutions-hub',
  },
  trailingSlash: false,
}

module.exports = nextConfig