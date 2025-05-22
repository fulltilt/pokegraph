import { memo, useState } from "react";
import { TopMoversChart } from "@/components/TopMoversChart";
import CardSearchInput from "@/components/CardSearchInput";

const TopGainers = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set`}
    order="DESC"
    range={timeframe}
  />
));

const TopGainersByPrice = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set-price`}
    order="DESC"
    range={timeframe}
  />
));

const TopLosers = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set`}
    order="ASC"
    range={timeframe}
  />
));

const TopLosersByPrice = memo(({ timeframe }: { timeframe: string }) => (
  <TopMoversChart
    url={`${import.meta.env.VITE_ENDPOINT_URL}/api/top-mover-per-set-price`}
    order="ASC"
    range={timeframe}
  />
));

export default function Main() {
  const [timeframe, setTimeframe] = useState<"10d" | "1m" | "3m" | "6m" | "1y">(
    "10d"
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex gap-2 mb-6 flex-wrap">
        {/* <CardSearchInput /> */}
      </div>

      <div className="space-y-4 col-span-4">
        <div className="flex gap-2">
          {(["10d", "1m", "3m", "6m", "1y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded border ${
                timeframe === tf ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <TopGainers timeframe={timeframe} />
          <TopLosers timeframe={timeframe} />
        </div>
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <TopGainersByPrice timeframe={timeframe} />
          <TopLosersByPrice timeframe={timeframe} />
        </div>
      </div>
    </div>
  );
}
