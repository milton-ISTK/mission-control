/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable server-side file watching for memory sync
  serverRuntimeConfig: {
    memoryDir: process.env.MEMORY_DIR || '/Users/milton/.openclaw/workspace',
  },
  publicRuntimeConfig: {
    appName: 'ISTK: Agentic Mission Control',
  },
};

module.exports = nextConfig;
