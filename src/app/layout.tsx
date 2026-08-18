import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNavigation from "@/components/BottomNavigation";
import { Toaster } from "@/components/ui/sonner";
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
  title: "할일 & 정기입금 매니저",
  description: "스마트한 할일 관리와 정기 계좌이체 입금 일정 알림",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "할일",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-100/60 font-sans text-foreground flex justify-center">
        <div className="flex flex-1 flex-col w-full max-w-lg min-h-screen bg-background shadow-lg shadow-slate-200/50 relative pb-28">
          {children}
          <BottomNavigation />
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

