/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // S3-hosted images uploaded via the admin panel / profile avatars.
      { protocol: "https", hostname: "sruvalleonlinestore-prod.s3.ap-south-1.amazonaws.com" },
      // Legacy Azure Blob images uploaded before the S3 migration.
      { protocol: "https", hostname: "**.blob.core.windows.net" },
    ],
  },
};

export default nextConfig;
