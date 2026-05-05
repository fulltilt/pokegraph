import { useState } from "react";
import { useSetsBySeries } from "@/hooks/useSetsBySeries";
import { Link } from "react-router-dom";

const seriesList = ["Scarlet & Violet", "Sword & Shield", "Sun & Moon"];
const skeletonKeys = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
  "skeleton-7",
  "skeleton-8",
  "skeleton-9",
  "skeleton-10",
];

export default function Sets() {
  const [activeSeries, setActiveSeries] = useState(seriesList[0]);

  const { sets, loading } = useSetsBySeries(activeSeries);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        {seriesList.map((series) => (
          <button
            key={series}
            type="button"
            onClick={() => setActiveSeries(series)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeSeries === series
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/70 bg-card/70 text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {series}
          </button>
        ))}
      </div>

      {loading ? (
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {skeletonKeys.map((key) => (
              <div
                key={key}
                className="flex h-[210px] animate-pulse flex-col items-center rounded-2xl border border-border/60 bg-card/70 p-4"
              >
                <div className="mb-3 h-16 w-20 rounded bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-2 h-3 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sets.map((set) => (
              <Link
                key={set.set_id}
                to={`/sets/${set.set_id}?name=${set.set_name}&release_date=${set.release_date}&image=${set.image}`}
                className="h-full"
              >
                <article className="flex h-full min-h-[210px] flex-col items-center rounded-2xl border border-border/60 bg-card/80 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
                  <img
                    src={set.image}
                    alt={set.set_name}
                    className="mb-3 h-16 w-full object-contain"
                  />
                  <span className="line-clamp-2 text-sm font-semibold text-foreground">
                    {set.set_name}
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">
                    {set.release_date}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
