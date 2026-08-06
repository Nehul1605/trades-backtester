/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
