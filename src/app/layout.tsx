import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copy Command Center",
  description: "Advanced Copywriting Management and Generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <RefreshButton />
      </body>
    </html>
  );
}
