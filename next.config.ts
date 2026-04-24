import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.12'],
  turbopack: {},
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
