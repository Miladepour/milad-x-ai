/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dbwrh0pfu/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/%D8%AF%D9%88%D8%B1%D9%87",
        destination: "/courses",
        permanent: true,
      },
      {
        source: "/%D8%AF%D9%88%D8%B1%D9%87/:slug*",
        destination: "/courses/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
