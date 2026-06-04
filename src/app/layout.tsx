import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xentio OS — Command Your Future",
  description:
    "Xentio OS — the operating system for visionaries. Home of OMG, the spare parts distribution platform.",
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-bg0 text-ink antialiased overflow-x-hidden leading-relaxed">
        {children}
      </body>
    </html>
  );
}
