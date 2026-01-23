/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving for locales
  async rewrites() {
    return [
      {
        source: "/locales/:path*",
        destination: "/locales/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
