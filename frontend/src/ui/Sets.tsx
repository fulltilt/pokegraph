import { useState } from "react";
import { useSetsBySeries } from "@/hooks/useSetsBySeries";

const seriesList = ["Scarlet & Violet", "Sword & Shield", "Sun & Moon"];

export default function Sets() {
  const [activeSeries, setActiveSeries] = useState(seriesList[0]);

  const { sets, loading, error } = useSetsBySeries(activeSeries);

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        {seriesList.map((series) => (
          <button
            key={series}
            onClick={() => setActiveSeries(series)}
            className={`px-4 py-2 rounded ${
              activeSeries === series
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {series}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-[20%] py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 rounded p-4 h-32 flex flex-col items-center"
              >
                <div className="bg-gray-300 h-12 w-12 rounded mb-2" />
                <div className="bg-gray-300 h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-[20%] py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sets.map((set) => (
              <a
                href={`/sets/${set.set_id}?name=${set.set_name}&release_date=${set.release_date}&image=${set.image}`}
              >
                <button
                  key={set.set_id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col items-center text-center cursor-pointer"
                  // onClick={() => setSelectedSet(set.set_name)}
                >
                  <img
                    src={set.image}
                    alt={set.set_name}
                    className="h-16 object-contain mb-2"
                  />
                  <span className="font-medium">{set.set_name}</span>
                  <span className="text-xs text-gray-500">
                    {set.release_date}
                  </span>
                </button>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
