/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.financialmodelingprep.com',
        pathname: '/symbol/**',
      },
      {
        protocol: 'https',
        hostname: 'images.financialmodelingprep.com',
        pathname: '/news/**',
      },
    ],
  },
};

export default nextConfig;
