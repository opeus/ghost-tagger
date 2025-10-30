/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GHOST_ADMIN_API_KEY: process.env.GHOST_ADMIN_API_KEY,
    GHOST_CONTENT_API_KEY: process.env.GHOST_CONTENT_API_KEY,
    GHOST_API_URL: process.env.GHOST_API_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
