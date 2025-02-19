/** @type {import("next").NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/quotes/overview",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
