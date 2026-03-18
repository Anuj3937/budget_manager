import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Financial Insights',
  description: 'Learn the best strategies to track expenses, budget money, and achieve financial freedom.',
};

export default function BlogHub() {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-4xl font-headline font-bold mb-4">Financial Insights</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Welcome to the Cashflow Clarity blog. Here you'll find the best tips from our founders on managing your money.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Blog Card */}
        <a href="#" className="group flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
          <div className="h-40 w-full rounded-md bg-muted flex items-center justify-center overflow-hidden">
             <span className="text-muted-foreground">Coming Soon</span>
          </div>
          <h2 className="text-xl font-bold group-hover:text-primary transition-colors">How to Track Expenses Like a Pro</h2>
          <p className="text-sm text-muted-foreground">Mastering your cashflow starts with understanding where your money goes every single day.</p>
        </a>
      </div>
    </div>
  );
}
