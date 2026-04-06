import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monvia",
  description: "Modern bookkeeping for freelancers and small businesses. Track income, expenses, time, and cash flow without spreadsheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex min-h-full flex-col font-sans">
        <Nav />
        {children}
      </body>
    </html>
  );
}
