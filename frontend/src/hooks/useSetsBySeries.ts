import { SetItem } from "@/types";
import { useEffect, useState } from "react";

export function useSetsBySeries(series: string): {
  sets: SetItem[];
  loading: boolean;
  error: null | string;
} {
  const [sets, setSets] = useState<SetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${
        import.meta.env.VITE_ENDPOINT_URL
      }/api/sets-by-series?series=${encodeURIComponent(series)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sets");
        return res.json();
      })
      .then((data) => setSets(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [series]);

  return { sets, loading, error };
}
