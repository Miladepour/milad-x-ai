/** @type {import('next').NextConfig} */
const nextConfig = {
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
