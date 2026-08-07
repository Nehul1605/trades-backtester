/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/verification",
        destination: "/verification-pending",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
