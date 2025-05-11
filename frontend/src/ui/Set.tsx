import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CardGrid from "@/components/CardGrid";
import { useSearchParams } from "react-router-dom";
import { TopMoversChart } from "@/components/TopMoversChart";

// Types
type SetInfo = {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  logo: string;
  totalCards: number;
};

export default function Set() {
  const { setId } = useParams<{ setId: string }>();

  const [searchParams] = useSearchParams();
  const setName = searchParams.get("name") || "";
  const releaseDate = searchParams.get("release_date") || "";
  const image = searchParams.get("image") || "";

  const [timeframe, setTimeframe] = useState<"10d" | "1m" | "3m" | "6m" | "1y">(
    "10d"
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Set Information */}
        <div className="space-y-4 col-span-1">
          <div className="space-y-2 flex flex-col items-center">
            <img src={image} alt={`${setName} logo`} className="h-20" />
            <h1 className="text-2xl font-semibold">{setName}</h1>
            {/* <p className="text-gray-600">Series: {setInfo.series}</p> */}
            <p className="text-gray-600">
              Release Date: {new Date(releaseDate).toLocaleDateString()}
            </p>
            {/* <p className="text-gray-600">Total Cards: {setInfo.totalCards}</p> */}
          </div>
        </div>

        {/* Top Movers Chart */}
        <div className="space-y-4 col-span-4">
          <div className="flex gap-2">
            {(["10d", "1m", "3m", "6m", "1y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded border ${
                  timeframe === tf
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Placeholder for TopMoversChart */}
          <div className="col-span-4 grid grid-cols-2 gap-4">
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

      {/* Card List */}
      {/* Add key prop to force re-render when selectedSet changes */}
      <CardGrid set={setName} key={setName} />
    </div>
  );
}
