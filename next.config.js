/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  images: {
    domains: [
      'inkdrop-backend.vercel.app',
      'i.pinimg.com',
      'slbosebjvnotrifwhbrl.supabase.co',
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
});

module.exports = nextConfig;