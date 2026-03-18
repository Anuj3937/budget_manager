"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Wallet, Sparkles, ChevronRight, Activity, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    <div className="flex flex-col min-h-screen bg-[#090d15] text-slate-50 selection:bg-primary/30 overflow-hidden relative font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Immersive Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50 animation-pulse-slow"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>

      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#090d15]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-amber-600 p-2 rounded-xl shadow-[0_0_15px_rgba(255,200,0,0.3)]">
            <Wallet className="h-6 w-6 text-[#090d15]" />
          </div>
          <span className="text-2xl font-headline font-black tracking-tight text-white">Cashflow Clarity</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button className="h-10 px-6 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(255,200,0,0.4)] transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main ref={containerRef} className="flex-1 flex flex-col items-center justify-start text-center px-4 pt-24 lg:pt-36 relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          style={{ y, opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl space-y-8 flex flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-md shadow-2xl"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-slate-300">The Ultimate Financial Operating System</span>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-headline tracking-tighter text-white leading-[1.05] drop-shadow-2xl">
            Stop guessing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary/80 filter drop-shadow-[0_0_30px_rgba(255,200,0,0.3)]">
              Start building wealth.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            A deeply analytical, exquisitely designed dashboard that gives you absolute financial clarity without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 w-full">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-bold shadow-[0_0_50px_-10px_rgba(255,200,0,0.5)] hover:shadow-[0_0_80px_-15px_rgba(255,200,0,0.6)] hover:-translate-y-1 transition-all duration-300">
                Start Tracking Free <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 text-lg rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all duration-300">
                Explore Features <ChevronRight className="ml-2 h-5 w-5 opacity-70" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, rotateX: 10, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, type: "spring", stiffness: 50 }}
          style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
          className="mt-20 w-full max-w-6xl relative z-20 group"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          {/* Glassmorphic Browser Frame */}
          <div className="relative rounded-t-[2rem] rounded-b-xl border border-white/20 bg-[#0f172a]/80 backdrop-blur-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-700 group-hover:rotate-x-0">
            {/* Window Controls */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-black/20">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            {/* Fake Dashboard Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 bg-gradient-to-b from-transparent to-black/40">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-4 border-r border-white/10 pr-6">
                <div className="h-8 w-24 bg-white/10 rounded-md"></div>
                <div className="h-8 w-full bg-primary/20 border border-primary/50 rounded-md"></div>
                <div className="h-8 w-full bg-white/5 rounded-md"></div>
                <div className="h-8 w-full bg-white/5 rounded-md"></div>
              </div>
              
              {/* Main Content Area */}
              <div className="col-span-1 md:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="space-y-2">
                     <div className="h-6 w-48 bg-white/20 rounded-md"></div>
                     <div className="h-4 w-32 bg-white/10 rounded-md"></div>
                   </div>
                   <div className="h-10 w-40 bg-white/10 rounded-full"></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center p-4">
                    <div className="h-4 w-20 bg-white/20 rounded mb-4"></div>
                    <div className="h-8 w-32 bg-primary/80 rounded"></div>
                  </div>
                  <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center p-4">
                    <div className="h-4 w-20 bg-white/20 rounded mb-4"></div>
                    <div className="h-8 w-24 bg-white/80 rounded"></div>
                  </div>
                  <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center p-4">
                    <div className="h-4 w-20 bg-white/20 rounded mb-4"></div>
                    <div className="h-8 w-24 bg-white/80 rounded"></div>
                  </div>
                </div>

                <div className="h-64 rounded-xl bg-gradient-to-t from-primary/10 to-transparent border border-white/10 relative overflow-hidden">
                   {/* Fake Chart Lines */}
                   <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 Q20,80 40,90 T80,40 T100,50 L100,100 Z" fill="rgba(255, 200, 0, 0.1)" />
                      <path d="M0,80 Q25,60 50,70 T100,20" fill="none" stroke="rgba(255, 200, 0, 0.8)" strokeWidth="2" />
                   </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-40 mb-32 text-left relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-500"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform duration-500">
              <Activity className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Elite Analytics</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Immerse yourself in interactive area charts and custom date ranges that map exactly how your wealth compounds over time.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-500"
          >
            <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Absolute Privacy</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Secured by enterprise-grade Firebase rules. Your data is mathematically isolated and never sold to third parties.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-primary/50 transition-all duration-500"
          >
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
              <PieChart className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Surgical Drill-Downs</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Click on any slice of your portfolio and instantly filter thousands of transactions to see precisely where your money went.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
