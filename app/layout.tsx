import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SWRegister } from "@/components/sw-register";

export const metadata: Metadata = {
  title: "Waler Dry Dock — Tersane İş Takip",
  description: "Dry dock tersane iş takip sistemi MVP",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Waler Dry Dock",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
