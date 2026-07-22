import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { AudioAutoplay } from "@/components/kids/AudioAutoplay";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={fredoka.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AudioAutoplay />
        {children}
      </body>
    </html>
  );
}
