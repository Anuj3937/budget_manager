import { BrainCircuit, LineChart, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureSection() {
  const features = [
    {
      icon: <LineChart className="h-10 w-10 text-primary" />,
      title: "Real-Time Cashflow Insight",
      description: "Stop guessing where your money went. Our premium data pipelines instantly filter your transactions into actionable visual intelligence, rendering massive datasets into simple, glowing clarity.",
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Intelligent Budgeting",
      description: "Set percentage-based allocation limits and watch as Horizon's mathematical engine automatically maps your safety margins. The dashboard dynamically responds to your spending velocity.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Absolute Data Sovereignty",
      description: "Your financial history belongs to you alone. We utilize bank-grade Firebase Cloud Firestore encryption, strictly mapping authentication clusters directly to individual sandboxes so no one else can touch your data.",
    },
  ];

  return (
    <section className="relative z-20 bg-[#06080c] text-white py-32 px-6">
      {/* Subtle border gradient separator */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6 drop-shadow-[0_0_15px_rgba(255,200,0,0.1)]">
            Command Your Capital
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Traditional spreadsheets are dead. We engineered Horizon to give you the absolute highest echelon of financial clarity wrapped in a stunning, borderless interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <Card key={idx} className="bg-[#0a0d14] border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden group">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <div className="mb-6 p-4 rounded-2xl bg-[#111620] shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(255,200,0,0.15)] transition-shadow duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
