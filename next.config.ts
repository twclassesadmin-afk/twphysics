import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Lets the dev server accept requests from your phone/other devices on the
  // LAN when testing via the "Network:" URL Next prints on `next dev`.
  // Wildcards match per segment, so this covers whatever IP the router hands
  // out on a typical home/office network (dev server only).
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
