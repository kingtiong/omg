/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Build is run on a memory-constrained box (1.9 GB RAM).
  // We skip lint + type-check during `next build` to halve memory and time.
  // Run `npm run typecheck` separately as a pre-deploy gate.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
