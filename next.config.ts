import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/home.html", destination: "/" },
      { source: "/about.html", destination: "/about" },
      { source: "/gallery.html", destination: "/gallery" },
      { source: "/blog.html", destination: "/blog" },
      { source: "/nominate.html", destination: "/nominate" },
      { source: "/rsvp.html", destination: "/rsvp" },
      { source: "/admin.html", destination: "/admin" },
    ];
  },
};

export default nextConfig;
