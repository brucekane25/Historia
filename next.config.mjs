/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized : true,
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "upload.wikimedia.org",
  //       port: "",
  //       pathname: "/**",
  //     },
  //   ],
  },
};

export default nextConfig;
