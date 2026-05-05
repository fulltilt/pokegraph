import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Movers = {
  card_id: string;
  card_name: string;
  early_price: number;
  recent_price: number;
  percent_change: string | null;
  absolute_change: string | null;
  image: string;
  release_date: string;
  set_id: string;
  set_name: string;
  total_sales?: number;
};

type ChartDatum = Movers & {
  changeValue: number;
};

type Metric = "percent_change" | "absolute_change";

type TopMoversChartProps = Readonly<{
  url?: string;
  order?: "ASC" | "DESC";
  range?: string;
  subtitle?: string;
}>;

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function getMetric(cards: Movers[]): Metric {
  return cards.some((card) => card.percent_change !== null)
    ? "percent_change"
    : "absolute_change";
}

function formatChange(value: number, metric: Metric) {
  if (metric === "percent_change") {
    return `${value > 0 ? "+" : ""}${percentFormatter.format(value)}%`;
  }

  return `${value > 0 ? "+" : ""}${currencyFormatter.format(value)}`;
}

function MoversTooltip({
  active,
  payload,
  metric,
}: TooltipProps<number, string> & { metric: Metric }) {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload as ChartDatum | undefined;

  if (!datum) {
    return null;
  }

  return (
    <div
      className="pointer-events-none min-w-56 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur"
      style={{ transform: "translate(-50%, calc(-100% - 16px))" }}
    >
      <img
        src={datum.image}
        alt={datum.card_name}
        className="mx-auto mb-3 h-20 w-auto object-contain"
      />
      <div className="text-base font-semibold tracking-tight">
        {datum.card_name}
      </div>
      <div className="text-sm text-muted-foreground">{datum.set_name}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="text-muted-foreground">Start</span>
        <span className="text-right font-medium">
          {currencyFormatter.format(datum.early_price)}
        </span>
        <span className="text-muted-foreground">Current</span>
        <span className="text-right font-medium">
          {currencyFormatter.format(datum.recent_price)}
        </span>
        <span className="text-muted-foreground">Change</span>
        <span
          className={cn(
            "text-right font-semibold",
            datum.changeValue >= 0 ? "text-emerald-500" : "text-rose-500",
          )}
        >
          {formatChange(datum.changeValue, metric)}
        </span>
        {typeof datum.total_sales === "number" && (
          <>
            <span className="text-muted-foreground">Sales</span>
            <span className="text-right font-medium">{datum.total_sales}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function TopMoversChart(props: TopMoversChartProps) {
  const { url = "", order = "DESC", range = "10d", subtitle = "" } = props;

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<Movers[], Error, ChartDatum[]>({
    queryKey: ["top-movers", url, order, range],
    staleTime: 60_000,
    enabled: Boolean(url),
    queryFn: async ({ signal }) => {
      const response = await fetch(`${url}/${order}?timeframe=${range}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch top movers");
      }

      return response.json();
    },
    select: (cards) => {
      const metric = getMetric(cards);

      return cards
        .map((card) => ({
          ...card,
          changeValue: Number.parseFloat(card[metric] ?? "0"),
        }))
        .filter((card) => card.changeValue !== 0)
        .sort(
          (a: ChartDatum, b: ChartDatum) =>
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime(),
        );
    },
  });

  const metric: Metric =
    subtitle === "$ Change" ? "absolute_change" : "percent_change";
  const values = data.map((item) => item.changeValue);
  const maxValue = values.length ? Math.max(...values) : 0;
  const minValue = values.length ? Math.min(...values) : 0;
  const isLosers = order === "ASC";
  const title = `Top ${isLosers ? "Losers" : "Gainers"}`;
  const accentClass = isLosers ? "text-rose-500" : "text-emerald-500";
  const fill = isLosers ? "hsl(351 83% 61%)" : "hsl(158 64% 42%)";

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
        <CardHeader>
          <CardTitle>{title} by Set</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
        <CardHeader>
          <CardTitle>{title} by Set</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground">
            No movement found for this timeframe.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
      <CardHeader className="gap-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl tracking-tight">
              {title} by Set
            </CardTitle>
            <CardDescription className="mt-1">{subtitle}</CardDescription>
          </div>
          <div
            className={cn("text-sm font-semibold tracking-tight", accentClass)}
          >
            {data.length} active sets
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[260px] overflow-visible rounded-2xl bg-gradient-to-b from-background to-muted/20 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barSize={18}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="set_name" hide />
              <YAxis
                width={58}
                domain={
                  isLosers
                    ? [Math.floor(minValue * 1.1), 0]
                    : [0, Math.ceil(maxValue * 1.1)]
                }
                tickFormatter={(value) =>
                  formatChange(value, metric).replace(/^\+/, "")
                }
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                cursor={false}
                offset={12}
                wrapperStyle={{
                  pointerEvents: "none",
                  zIndex: 20,
                  overflow: "visible",
                }}
                content={<MoversTooltip metric={metric} />}
              />
              {isLosers && <ReferenceLine y={0} stroke="hsl(var(--border))" />}
              <Bar dataKey="changeValue" radius={[10, 10, 4, 4]}>
                {data.map((entry) => (
                  <Cell key={entry.card_id} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
