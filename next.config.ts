import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Lets the dev server accept requests from your phone/other devices on the
  // LAN when testing via the "Network:" URL Next prints on `next dev`.
  allowedDevOrigins: ["192.168.7.3", "192.168.7.8"],
};

export default nextConfig;
