import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@whiskeysockets/baileys", "sharp", "jimp", "@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {},
};

export default nextConfig;
