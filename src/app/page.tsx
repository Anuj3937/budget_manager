"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Cashflow Clarity',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'Any',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'A premium, deeply analytical dashboard designed to give you absolute clarity over your cashflow without the clutter. Best expense tracker to stop overspending.'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-xl font-headline font-bold">Cashflow Clarity</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="font-bold shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-start text-center px-4 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm shadow-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">The Premium Expense Tracker for Fast-Moving Founders</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tight text-foreground/90 leading-[1.1]">
            Stop overspending.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Start building wealth.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A premium, deeply analytical dashboard designed to give you absolute clarity over your cashflow without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-[0_0_40px_-10px_rgba(255,200,0,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,200,0,0.6)] transition-all">
                Start Tracking Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-32 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-border/50 bg-card/50 glassmorphism hover:border-primary/50 transition-colors"
          >
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Beautiful Analytics</h3>
            <p className="text-muted-foreground">Interactive charts and rolling totals let you visualize your wealth precisely.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl border border-border/50 bg-card/50 glassmorphism hover:border-primary/50 transition-colors"
          >
            <ShieldCheck className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Absolute Privacy</h3>
            <p className="text-muted-foreground">Your data is secured with enterprise-grade rules in Firebase. No third parties.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl border border-border/50 bg-card/50 glassmorphism hover:border-primary/50 transition-colors"
          >
            <Wallet className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Budgets</h3>
            <p className="text-muted-foreground">Set budgets per category and get instantly alerted before you overspend.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
