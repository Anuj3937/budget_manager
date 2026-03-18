import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/sidebar';
import { ThemeProvider } from '@/components/shared/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'Cashflow Clarity | Premium Expense Tracker',
    template: '%s | Cashflow Clarity'
  },
  description: 'Take control of your finances with Cashflow Clarity. A premium, modern expense tracker with powerful analytics, budgeting, and beautiful visualizations.',
  keywords: ['Expense Tracker', 'Personal Finance', 'Budgeting', 'Financial Dashboard', 'Money Management'],
  authors: [{ name: 'Cashflow Clarity' }],
  creator: 'Cashflow Clarity',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cashflowclarity.vercel.app',
    title: 'Cashflow Clarity | Premium Expense Tracker',
    description: 'Take control of your finances with Cashflow Clarity. A premium, modern expense tracker with powerful analytics and beautiful visualizations.',
    siteName: 'Cashflow Clarity',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cashflow Clarity | Premium Expense Tracker',
    description: 'Take control of your finances with Cashflow Clarity. A premium, modern expense tracker with powerful analytics and beautiful visualizations.',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#171a21" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FirebaseClientProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex flex-1 flex-col">
                {children}
              </div>
            </SidebarProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
