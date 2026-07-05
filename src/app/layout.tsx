import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { SessionProvider } from "@/lib/session-provider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "今天玩什么",
  description: "一个轻轻接住每个念头的小伙伴",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f1e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
