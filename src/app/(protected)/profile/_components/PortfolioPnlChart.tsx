"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { dateLocale } from "@/i18n/config";
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

export type PnlDataPoint = {
  date: string;
  pnl: number;
};

export function PortfolioPnlChart({ data }: { data: PnlDataPoint[] }) {
  const t = useTranslations("profile");
  const tChart = useTranslations("chart");
  const locale = useLocale();
  const chartDateLocale = dateLocale(locale);
  const chartConfig = {
    pnl: {
      label: tChart("pnl"),
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;
  const isLoss = data.length > 0 && data[data.length - 1].pnl < 0;
  // Conditionally set the colors based on performance
  const strokeColor = isLoss
    ? "hsl(var(--destructive))"
    : "hsl(var(--chart-2))";
  const fillColorId = isLoss ? "fillRed" : "fillGreen";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portfolioPerformance")}</CardTitle>
        <CardDescription>{t("portfolioDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--destructive))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--destructive))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={`hsl(var(--muted-foreground), 0.5)`}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: `hsl(var(--muted-foreground))` }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString(chartDateLocale, {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: `hsl(var(--muted-foreground))` }}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString(chartDateLocale)
                  }
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    tChart("pnl"),
                  ]}
                />
              }
            />
            {/* A line at y=0 to show break-even point */}
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Area
              dataKey="pnl"
              type="monotone"
              fill={`url(#${fillColorId})`}
              stroke={strokeColor}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
