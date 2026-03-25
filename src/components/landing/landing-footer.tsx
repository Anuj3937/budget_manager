import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="relative z-20 bg-[#000] text-slate-400 py-20 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center p-1 rounded-lg bg-black/20 shadow-[0_0_15px_rgba(255,200,0,0.1)] ring-1 ring-white/10">
              <Image src="/logo.png" alt="Horizon Logo" width={24} height={24} className="rounded-md object-contain" />
            </div>
            <span className="text-xl font-headline font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,200,0,0.2)]">Horizon</span>
          </div>
          <p className="text-slate-500 max-w-sm leading-relaxed mb-6">
            The definitive financial analytics engine. Command your capital, map your velocity, and shape the future of your wealth with absolute clarity.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
              X
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
              In
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide">Product</h4>
          <ul className="space-y-4">
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            <li><Link href="#features" className="hover:text-primary transition-colors">Analytics Flow</Link></li>
            <li><Link href="#security" className="hover:text-primary transition-colors">Security</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Horizon Analytics Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">Designed with <span className="text-primary">♥</span> for founders.</p>
      </div>
    </footer>
  );
}
