import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  type TooltipProps,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PriceHistory = {
  date: string;
  price: number;
  quantity: number;
};

type Bucket = {
  start: string;
  end: string;
  price: number;
  quantity: number;
  label: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function normalizePriceData(
  data: PriceHistory[],
  targetBuckets: number = 50,
): Bucket[] {
  if (!data.length) return [];

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const startDate = new Date(sortedData[0].date);
  const endDate = new Date(sortedData[sortedData.length - 1].date);
  const totalDuration = Math.max(endDate.getTime() - startDate.getTime(), 1);
  const bucketDuration = Math.max(Math.ceil(totalDuration / targetBuckets), 1);

  const buckets: Bucket[] = [];
  let index = 0;

  while (index < sortedData.length) {
    const currentBucketStart = new Date(sortedData[index].date);
    const currentBucketEnd = new Date(
      Math.min(
        currentBucketStart.getTime() + bucketDuration,
        endDate.getTime() + 1,
      ),
    );

    const bucketData: PriceHistory[] = [];

    while (index < sortedData.length) {
      const entry = sortedData[index];
      const entryDate = new Date(entry.date).getTime();

      if (entryDate >= currentBucketEnd.getTime()) {
        break;
      }

      bucketData.push(entry);
      index += 1;
    }

    const totalQuantity = bucketData.reduce((sum, d) => sum + d.quantity, 0);
    const averagePrice =
      totalQuantity > 0
        ? bucketData.reduce((sum, d) => sum + d.price * d.quantity, 0) /
          totalQuantity
        : 0;

    if (bucketData.length > 0) {
      buckets.push({
        start: currentBucketStart.toISOString(),
        end: currentBucketEnd.toISOString(),
        label: currentBucketStart.toISOString(),
        price: Number.parseFloat(averagePrice.toFixed(2)),
        quantity: totalQuantity,
      });
    }
  }

  return buckets;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const { start, end, price, quantity } = payload[0].payload;
    return (
      <div
        className="pointer-events-none rounded-2xl border border-border/80 bg-background/95 p-4 text-sm shadow-xl backdrop-blur"
        style={{ transform: "translate(-50%, calc(-100% - 16px))" }}
      >
        <p>
          <strong>Date Range:</strong> {dateFormatter.format(new Date(start))} -{" "}
          {dateFormatter.format(new Date(end))}
        </p>
        <p>
          <strong>Avg Price:</strong> {currencyFormatter.format(price ?? 0)}
        </p>
        <p>
          <strong>Sales:</strong> {quantity}
        </p>
      </div>
    );
  }
  return null;
};

const CardPriceHistoryChart = ({
  cardId,
  timeframe,
}: {
  cardId: string;
  timeframe: string;
}) => {
  const { data = [], isLoading } = useQuery<PriceHistory[], Error, Bucket[]>({
    queryKey: ["card-history", cardId, timeframe],
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ENDPOINT_URL
        }/api/cards/history/${cardId}?timeframe=${timeframe}`,
        { signal },
      );
      if (!res.ok) throw new Error("Failed to fetch card history");
      return res.json();
    },
    select: (history) => normalizePriceData(history),
  });

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Price history</CardTitle>
          <CardDescription>
            Weighted average price vs. recorded sales volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
        <CardHeader>
          <CardTitle>Price history</CardTitle>
          <CardDescription>
            Weighted average price vs. recorded sales volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground">
            No chart data available for this timeframe.
          </div>
        </CardContent>
      </Card>
    );
  }

  const tickCount = Math.min(5, data.length);
  const tickStep = Math.max(1, Math.floor(data.length / tickCount));
  const ticks = data
    .filter((_, index) => index % tickStep === 0 || index === data.length - 1)
    .map((bucket) => bucket.start);

  return (
    <Card className="border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-xl tracking-tight">Price history</CardTitle>
        <CardDescription>
          Weighted average price vs. recorded sales volume
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[360px] overflow-visible rounded-2xl bg-gradient-to-b from-background to-muted/20 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="start"
                tickFormatter={(value) => dateFormatter.format(new Date(value))}
                interval="preserveStartEnd"
                ticks={ticks}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="left"
                width={48}
                label={{ value: "Sales", angle: -90, position: "insideLeft" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                width={64}
                orientation="right"
                label={{ value: "Price", angle: 90, position: "insideRight" }}
                tickFormatter={(value) => currencyFormatter.format(value)}
                tickLine={false}
                axisLine={false}
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
                content={<CustomTooltip />}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="quantity"
                fill="hsl(217 91% 60%)"
                name="Sales volume"
                radius={[10, 10, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                stroke="hsl(158 64% 42%)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                name="Avg price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardPriceHistoryChart;
