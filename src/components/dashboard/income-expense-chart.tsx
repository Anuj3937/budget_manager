"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ChartData = {
  month: string;
  income: number;
  expenses: number;
}[];

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-1))",
  },
};

export default function IncomeExpenseChart({ data }: { data: ChartData }) {
  return (
    <Card className="lg:col-span-4 h-full border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="tracking-tight text-2xl font-bold font-headline">Cashflow Velocity</CardTitle>
        <CardDescription>Income versus expenses over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="var(--color-income)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="var(--color-expenses)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
