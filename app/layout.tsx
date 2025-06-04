import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MouQi - 智能AI工具导航平台",
  description: "MouQi是专业的AI工具发现平台，汇聚全球优质AI工具，助力您的创作与工作效率提升。发现ChatGPT、Midjourney等热门AI应用。",
  keywords: "AI工具,人工智能,ChatGPT,Midjourney,AI导航,智能工具,MouQi,mouqi.com",
  authors: [{ name: "MouQi Team" }],
  creator: "MouQi",
  publisher: "MouQi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mouqi.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "MouQi - 智能AI工具导航平台",
    description: "发现全球优质AI工具，提升创作与工作效率",
    url: "https://mouqi.com",
    siteName: "MouQi",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MouQi - 智能AI工具导航平台",
    description: "发现全球优质AI工具，提升创作与工作效率",
    creator: "@MouQi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
