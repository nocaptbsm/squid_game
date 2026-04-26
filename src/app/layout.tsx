import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const mono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PARADOX — SQUID GAME",
  description: "Survive. Or don't.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Creepster&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className={`${mono.variable} min-h-screen bg-[#3a1c1e] text-[#c8bfbf] antialiased`}>
        {/* Atmosphere layers */}
        <div className="static-noise" aria-hidden />
        <div className="scan-line" aria-hidden />
        {children}
      </body>
    </html>
  );
}
