import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Geist } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { BottomNav } from '@/components/layout/BottomNav';
import { Providers } from '@/components/Providers';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Crave — Swipe to Order",
  description: "Discover delicious food with a swipe. Dark mode for late-night cravings.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Crave",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn(spaceGrotesk.variable, jetbrainsMono.variable, "font-sans", geist.variable)}>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          {/* Satoshi font via CDN (not available in next/font) */}
          <link 
            href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" 
            rel="stylesheet" 
          />
        </head>
        <body className="antialiased">
          <Providers>
            {/* Mobile Container - Centers content on desktop */}
            <div className="mobile-container">
              {/* Main Content Area */}
              <main className="main-content">
                {children}
              </main>
              
              {/* Bottom Navigation */}
              <BottomNav />
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
