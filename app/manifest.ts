import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuranEasy — কুরআনের শব্দ শিখি",
    short_name: "QuranEasy",
    description: "কুরআনের প্রতিটি শব্দ বাংলা ও ইংরেজিতে সহজে শিখুন। Learn every word of the Qur'an in Bangla & English.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#0e5a48",
    lang: "bn",
    categories: ["education", "books"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "রিভিউ / Review", url: "/bn/review/" },
      { name: "শিখুন / Learn", url: "/bn/learn/" },
      { name: "পড়ুন / Read", url: "/bn/read/" },
    ],
  };
}
