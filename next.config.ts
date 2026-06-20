import type { NextConfig } from "next";

const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
const isValidGaId = /^G-[A-Z0-9]{6,}$/i.test(gaId);

if (process.env.NODE_ENV === "production") {
  if (!gaId) {
    console.warn(
      "\n⚠️  [GA4] NEXT_PUBLIC_GA_ID is not set. Google Analytics will not load in production.\n" +
        "   Set it in Vercel → Project Settings → Environment Variables (Production), then redeploy.\n",
    );
  } else if (!isValidGaId) {
    console.warn(
      `\n⚠️  [GA4] NEXT_PUBLIC_GA_ID="${gaId}" is not a valid GA4 ID (expected G-XXXXXXXXXX).\n`,
    );
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
