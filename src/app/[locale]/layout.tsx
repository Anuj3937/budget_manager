import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: {
    default: 'Horizon | Premium Expense Tracker',
    template: '%s | Horizon'
  },
  description: 'Take control of your finances with Horizon. A premium, modern expense tracker with powerful analytics, budgeting, and beautiful visualizations.',
  keywords: ['Expense Tracker', 'Personal Finance', 'Budgeting', 'Financial Dashboard', 'Money Management'],
  authors: [{ name: 'Horizon' }],
  creator: 'Horizon',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://horizon-finance.vercel.app',
    title: 'Horizon | Premium Expense Tracker',
    description: 'Take control of your finances with Horizon. A premium, modern expense tracker with powerful analytics and beautiful visualizations.',
    siteName: 'Horizon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horizon | Premium Expense Tracker',
    description: 'Take control of your finances with Horizon. A premium, modern expense tracker with powerful analytics and beautiful visualizations.',
  },
  manifest: '/manifest.json',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#090d15" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <FirebaseClientProvider>
              <div className="flex flex-1 flex-col min-h-screen">
                {children}
              </div>
            </FirebaseClientProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
