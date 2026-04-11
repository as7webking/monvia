import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { PwaInstaller } from "@/components/pwa-installer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Monvia",
    template: "%s | Monvia",
  },
  description: "Modern bookkeeping for freelancers and small businesses. Track income, expenses, time, and cash flow without spreadsheets.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Monvia",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body suppressHydrationWarning className="min-h-full flex min-h-full flex-col font-sans">
        <PwaInstaller />
        {children}
        <Footer />
      </body>
    </html>
  );
}
