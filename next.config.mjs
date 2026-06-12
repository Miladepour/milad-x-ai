/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

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
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
                : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com https://*.supabase.co https://images.unsplash.com https://challenges.cloudflare.com",
              "font-src 'self' data:",
              isDev
                ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com ws://localhost:* ws://127.0.0.1:*"
                : "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://iframe.mediadelivery.net https://challenges.cloudflare.com",
              "media-src 'self' https://res.cloudinary.com https://*.b-cdn.net blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon",
        permanent: false,
      },
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
