import { useState } from "react";
import CardGrid from "@/components/CardGrid";
import { useSearchParams } from "react-router-dom";
import { TopMoversChart } from "@/components/TopMoversChart";
import { TimeframeTabs } from "@/components/TimeframeTabs";

const TIMEFRAME_OPTIONS = [
  { label: "10D", value: "10d" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
] as const;

export default function SetPage() {
  const [searchParams] = useSearchParams();
  const setName = searchParams.get("name") || "";
  const releaseDate = searchParams.get("release_date") || "";
  const image = searchParams.get("image") || "";

  const [timeframe, setTimeframe] = useState<"10d" | "1m" | "3m" | "6m" | "1y">(
    "10d",
  );

  return (
    <div className="space-y-8 p-6">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-lg shadow-black/5 backdrop-blur">
          <div className="flex flex-col items-center space-y-3 text-center">
            <img
              src={image}
              alt={`${setName} logo`}
              className="h-24 w-auto object-contain"
            />
            <h1 className="text-2xl font-semibold tracking-tight">{setName}</h1>
            <p className="text-sm text-muted-foreground">
              Release Date: {new Date(releaseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Set movers
              </h2>
              <p className="text-sm text-muted-foreground">
                Compare the biggest risers and fallers inside this set.
              </p>
            </div>
            <TimeframeTabs
              options={TIMEFRAME_OPTIONS}
              value={timeframe}
              onChange={(value) => setTimeframe(value as typeof timeframe)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <TopMoversChart
              url={`${
                import.meta.env.VITE_ENDPOINT_URL
              }/api/top-movers-by-set/${encodeURIComponent(setName)}`}
              order="DESC"
              range={timeframe}
            />

            <TopMoversChart
              url={`${
                import.meta.env.VITE_ENDPOINT_URL
              }/api/top-movers-by-set/${encodeURIComponent(setName)}`}
              order="ASC"
              range={timeframe}
            />
          </div>
        </div>
      </div>

      <CardGrid set={setName} key={setName} />
    </div>
  );
}
