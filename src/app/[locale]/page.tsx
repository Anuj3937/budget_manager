"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { useTranslations } from 'next-intl';
import { Component as HorizonHero } from "@/components/ui/horizon-hero-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { TrustSection } from "@/components/landing/trust-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  const { user, isUserLoading } = useUser();
  const t = useTranslations('Navigation');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Horizon',
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
    <div className="flex flex-col min-h-screen bg-[#000] selection:bg-primary/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Absolute Header Overlaying Horizon Component */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-5 border-b border-white/5 bg-transparent backdrop-blur-sm z-[100] hover:bg-[#000]/60 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-1 rounded-xl bg-black/20 shadow-[0_0_15px_rgba(255,200,0,0.15)] ring-1 ring-white/10">
            <Image src="/logo.png" alt="Horizon Logo" width={32} height={32} className="rounded-lg object-contain" />
          </div>
          <span className="text-2xl font-headline font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,200,0,0.3)]">Horizon</span>
        </div>
        <div className="flex gap-4 items-center">
          {!isUserLoading && user ? (
            <Link href="/dashboard">
              <Button className="h-10 px-6 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(255,200,0,0.4)] transition-all">
                {t('enterDashboard')}
              </Button>
            </Link>   
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                {t('logIn')}
              </Link>
              <Link href="/signup">
                <Button className="h-10 px-6 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(255,200,0,0.4)] transition-all">
                  {t('getStarted')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Engine */}
      <HorizonHero />

      {/* Narrative Pipeline */}
      <FeatureSection />
      <TrustSection />
      <LandingFooter />
    </div>
  );
}
