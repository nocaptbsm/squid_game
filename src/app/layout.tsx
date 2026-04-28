import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SquidHorrorTheme } from "@/components/squid/SquidHorrorTheme";
import { BackgroundAudio } from "@/components/squid/BackgroundAudio";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Paradox Admin",
  description: "Platform Administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <SquidHorrorTheme />
        <BackgroundAudio />
        {children}
      </body>
    </html>
  );
}
