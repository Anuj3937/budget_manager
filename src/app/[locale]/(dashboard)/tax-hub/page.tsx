"use client";

import { useState, useMemo } from "react";
import { Calculator, TrendingDown, IndianRupee, ArrowRight, Info, CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/layout/header";
import {
  compareTaxRegimes,
  SECTION_80C_LIMIT,
  SECTION_80D_LIMIT_SELF,
  type TaxBreakdown,
} from "@/lib/tax-calculator";
import { useCurrency } from "@/hooks/use-currency";

function TaxBreakdownCard({ breakdown, label }: { breakdown: TaxBreakdown; label: string }) {
  const { format: formatCurrency } = useCurrency();
  return (
    <Card className={`relative overflow-hidden`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {label}
          <Badge variant={breakdown.regime === 'new' ? 'default' : 'secondary'}>
            {breakdown.regime === 'new' ? 'New' : 'Old'} Regime
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Gross Income</p>
            <p className="font-semibold">{formatCurrency(breakdown.grossIncome)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Standard Deduction</p>
            <p className="font-semibold text-green-500">-{formatCurrency(breakdown.standardDeduction)}</p>
          </div>
          {breakdown.section80C > 0 && (
            <div>
              <p className="text-muted-foreground">Section 80C</p>
              <p className="font-semibold text-green-500">-{formatCurrency(breakdown.section80C)}</p>
            </div>
          )}
          {breakdown.section80D > 0 && (
            <div>
              <p className="text-muted-foreground">Section 80D</p>
              <p className="font-semibold text-green-500">-{formatCurrency(breakdown.section80D)}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Taxable Income</p>
            <p className="font-semibold">{formatCurrency(breakdown.taxableIncome)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tax + 4% Cess</p>
            <p className="font-semibold text-red-400">{formatCurrency(breakdown.totalTax)}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Effective Tax Rate</p>
            <p className="text-lg font-bold">{breakdown.effectiveRate.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly Take-Home</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(breakdown.monthlyTakeHome)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaxHubPage() {
  const { format: formatCurrency } = useCurrency();
  const [annualIncome, setAnnualIncome] = useState<number>(1200000);
  const [section80C, setSection80C] = useState<number>(0);
  const [section80D, setSection80D] = useState<number>(0);

  const comparison = useMemo(() => {
    return compareTaxRegimes(annualIncome, {
      section80C,
      section80D,
    });
  }, [annualIncome, section80C, section80D]);

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Tax Hub
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compare Old vs New tax regimes instantly. Calculate your exact tax liability for FY 2025-26 and find the best regime for your salary.
          </p>
        </div>

        {/* Income Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Your Annual Income (CTC)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="text-lg font-semibold max-w-xs"
              />
              <Badge variant="outline" className="text-sm">
                {(annualIncome / 100000).toFixed(1)} LPA
              </Badge>
            </div>
            <Slider
              value={[annualIncome]}
              min={0}
              max={10000000}
              step={50000}
              onValueChange={([val]) => setAnnualIncome(val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹0</span>
              <span>₹25L</span>
              <span>₹50L</span>
              <span>₹75L</span>
              <span>₹1Cr</span>
            </div>
          </CardContent>
        </Card>

        {/* Deductions (Old Regime) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              Deductions (Applicable to Old Regime)
            </CardTitle>
            <CardDescription>
              These deductions only apply if you choose the Old tax regime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Section 80C (ELSS, PPF, EPF, LIC)</span>
                <span className="text-sm text-muted-foreground">Max: ₹{(SECTION_80C_LIMIT / 1000).toFixed(0)}K</span>
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[section80C]}
                  min={0}
                  max={SECTION_80C_LIMIT}
                  step={5000}
                  onValueChange={([val]) => setSection80C(val)}
                  className="flex-1"
                />
                <span className="text-sm font-semibold min-w-[80px] text-right">
                  {formatCurrency(section80C)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Section 80D (Health Insurance)</span>
                <span className="text-sm text-muted-foreground">Max: ₹{(SECTION_80D_LIMIT_SELF / 1000).toFixed(0)}K</span>
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[section80D]}
                  min={0}
                  max={SECTION_80D_LIMIT_SELF}
                  step={1000}
                  onValueChange={([val]) => setSection80D(val)}
                  className="flex-1"
                />
                <span className="text-sm font-semibold min-w-[80px] text-right">
                  {formatCurrency(section80D)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regime Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TaxBreakdownCard breakdown={comparison.oldRegime} label="Old Regime" />
          <TaxBreakdownCard breakdown={comparison.newRegime} label="New Regime" />
        </div>

        {/* Recommendation Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <CheckCircle2 className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h3 className="text-lg font-bold">
                Recommended: <span className="text-primary">{comparison.recommended === 'new' ? 'New' : 'Old'} Regime</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                You save <span className="font-semibold text-green-500">{formatCurrency(comparison.savings)}</span> per year by choosing the {comparison.recommended === 'new' ? 'New' : 'Old'} regime.
                That&apos;s <span className="font-semibold text-green-500">{formatCurrency(comparison.savings / 12)}</span> more in your pocket every month.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Section 87A Rebate</p>
                <p className="text-xs text-muted-foreground">
                  No tax if taxable income ≤ ₹12L (New) or ≤ ₹5L (Old).
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <FileText className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Standard Deduction</p>
                <p className="text-xs text-muted-foreground">
                  ₹75,000 (New Regime) / ₹50,000 (Old Regime) for salaried individuals.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <IndianRupee className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Health & Education Cess</p>
                <p className="text-xs text-muted-foreground">
                  4% cess is applied on the total tax amount in both regimes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
