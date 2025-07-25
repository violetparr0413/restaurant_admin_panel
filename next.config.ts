import type { NextConfig } from "next";
import { i18n } from './next-i18next.config';
import { I18NConfig } from "next/dist/server/config-shared";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: i18n as I18NConfig,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
