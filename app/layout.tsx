import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/AppContext';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0f17' },
    { media: '(prefers-color-scheme: light)', color: '#10b981' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'My Pocket Tracker - Unified Personal & Business Finance Platform',
  description: 'One beautiful dashboard to manage personal incomes, expenses, savings goals, and multiple businesses seamlessly. Built for creators, builders, and modern enterprises.',
  applicationName: 'PocketTracker',
  authors: [{ name: 'My Pocket Tracker Team' }],
  generator: 'Next.js',
  keywords: ['fintech', 'pwa', 'personal finance', 'business accounting', 'multi-currency', 'budget tracker', 'invoice generator', 'offline-first'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PocketTracker'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'My Pocket Tracker',
    description: 'Unified Personal & Business Finance Platform',
    type: 'website',
    url: 'https://mypockettracker.io',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'My Pocket Tracker' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Pocket Tracker',
    description: 'Unified Personal & Business Finance Platform',
    images: ['/icons/icon-512x512.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans overscroll-none selection:bg-primary selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
