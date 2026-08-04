import './globals.css';
import { AppProvider } from '@/lib/AppContext';

export const metadata = {
  title: 'My Pocket Tracker - Unified Personal & Business Finance Platform',
  description: 'One beautiful dashboard to manage personal incomes, expenses, savings goals, and multiple businesses seamlessly. Built for creators, builders, and modern enterprises.',
  keywords: 'fintech, saas, personal finance, business accounting, multi-currency, budget tracker, invoice generator, AI insights',
  openGraph: {
    title: 'My Pocket Tracker',
    description: 'Unified Personal & Business Finance Platform',
    type: 'website',
    url: 'https://mypockettracker.io',
    images: [{ url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&h=630&fit=crop' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Pocket Tracker',
    description: 'Unified Personal & Business Finance Platform'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
