import { memo, useState } from "react";
import { TopMoversChart } from "@/components/TopMoversChart";
import QuantitySpikesTable from "@/components/QuantitySpikesTable";
import { TimeframeTabs } from "@/components/TimeframeTabs";

const TIMEFRAME_OPTIONS = [
  { label: "10D", value: "10d" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
] as const;

const TopGainers = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    subtitle="% Change"
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set`}
    order="DESC"
    range={timeframe}
  />
));

const TopGainersByPrice = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    subtitle="$ Change"
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set-price`}
    order="DESC"
    range={timeframe}
  />
));

const TopLosers = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    subtitle="% Change"
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set`}
    order="ASC"
    range={timeframe}
  />
));

const TopLosersByPrice = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    subtitle="$ Change"
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set-price`}
    order="ASC"
    range={timeframe}
  />
));

export default function Main() {
  const [timeframe, setTimeframe] = useState<"10d" | "1m" | "3m" | "6m" | "1y">(
    "10d",
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-8">
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_35%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Market dashboard
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Top gainers, losers, and volume spikes in one pass.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Compare directional movement across sets, switch timeframes
                without jarring refetches, and review volume spikes below.
              </p>
            </div>
          </div>
          <TimeframeTabs
            options={TIMEFRAME_OPTIONS}
            value={timeframe}
            onChange={(value) => setTimeframe(value as typeof timeframe)}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Price movement
            </h2>
            <p className="text-sm text-muted-foreground">
              Highest and lowest movers by percentage and absolute price change.
            </p>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <TopGainers timeframe={timeframe} />
          <TopLosers timeframe={timeframe} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <TopGainersByPrice timeframe={timeframe} />
          <TopLosersByPrice timeframe={timeframe} />
        </div>
      </section>

      <section className="space-y-4">
        <QuantitySpikesTable />
      </section>
    </div>
  );
}
