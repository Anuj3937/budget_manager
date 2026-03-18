"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

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
  ChartLegendContent
} from "@/components/ui/chart";

type ChartData = {
  name: string;
  value: number;
  fill: string;
}[];

const chartConfig = {
  value: {
    label: "Amount",
  },
  Rent: {
    label: "Rent",
    color: "hsl(var(--chart-1))",
  },
  Groceries: {
    label: "Groceries",
    color: "hsl(var(--chart-2))",
  },
  Utilities: {
    label: "Utilities",
    color: "hsl(var(--chart-3))",
  },
  'Dining Out': {
    label: "Dining Out",
    color: "hsl(var(--chart-4))",
  },
  Transport: {
    label: "Transport",
    color: "hsl(var(--chart-5))",
  },
  Other: {
    label: "Other",
    color: "hsl(var(--muted-foreground))",
  },
};

export default function ExpenseCategoryChart({ data }: { data: ChartData }) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col lg:col-span-3 h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>This month's spending breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
