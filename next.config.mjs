/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    experimental: {
      // Allow importing from outside the app directory (sibling project dir)
      externalDir: true,
    },
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');

      // Alias react-router-dom to our Next.js shim
      if (!config.resolve) config.resolve = {};
      if (!config.resolve.alias) config.resolve.alias = {};
      config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'lib/react-router-shim.tsx');

      // Increase chunk load timeout to reduce transient dev-time ChunkLoadError timeouts
      // https://webpack.js.org/configuration/output/#outputchunkloadtimeout
      if (!config.output) config.output = {};
      config.output.chunkLoadTimeout = 300000; // 5 minutes
      return config;
    },
  };
  
  export default nextConfig;
  