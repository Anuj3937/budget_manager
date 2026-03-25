import Image from "next/image";

export function TrustSection() {
  const testimonials = [
    {
      quote: "The interface is so seamless that checking my budget became a dopamine hit instead of a chore. Absolutely unparalleled data clarity.",
      author: "Sarah Jenkins",
      title: "Startup Founder"
    },
    {
      quote: "Horizon replaced three different financial apps for me. The velocity engine is a gamechanger for predictive cashflow analysis.",
      author: "Marcus Vance",
      title: "Angel Investor"
    },
    {
      quote: "A masterclass in UI design. It feels like I have an institutional-grade Bloomberg terminal right on my phone.",
      author: "Elena Rodriguez",
      title: "Creative Director"
    }
  ];

  return (
    <section className="relative z-20 bg-black text-white py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-100 tracking-tight">
            Trusted by Builders & Visionaries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-gradient-to-b from-[#111620] to-[#0a0d14] border border-white/5 ring-1 ring-white/5 shadow-2xl relative group">
              <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(255,200,0,0.5)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-slate-300 text-lg italic mb-8 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-32 pt-16 flex flex-wrap justify-center items-center gap-12 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <span className="text-2xl font-black tracking-widest text-[#fff]">ACME CORP</span>
           <span className="text-2xl font-black font-serif italic text-[#fff]">Stark Ind.</span>
           <span className="text-2xl font-extrabold tracking-tighter text-[#fff]">Globex</span>
           <span className="text-2xl font-black tracking-widest text-[#fff]">SOYLENT</span>
        </div>
      </div>
    </section>
  );
}
