import type { Metadata } from "next";
import { Fredoka, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import "./mandarin.css";
import { AudioAutoplay } from "@/components/kids/AudioAutoplay";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// CJK fallback for Mandarin content — Noto Sans SC (Simplified Chinese)
// is Google's high-legibility Chinese typeface. Fredoka doesn't cover
// CJK glyphs, so Chinese characters silently fall through to browser
// default. Loading Noto SC into a CSS variable lets the Mandarin subject
// route render Chinese cleanly while English routes stay on Fredoka.
const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "YouSeed · Language Adventure",
  description: "A fun, quick online test to discover your language level — for kids aged 4 to 12.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/youseed-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/brand/youseed-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/brand/youseed-icon-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${notoSC.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AudioAutoplay />
        {children}
      </body>
    </html>
  );
}
