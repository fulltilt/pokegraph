import { useEffect, useState } from "react";

export function useCardSearch(query: string, delay = 500) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(handler);
  }, [query, delay]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/cards-search?name=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !Array.isArray(data)) {
          setResults([]); // gracefully handle bad response
        } else {
          setResults(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Search failed", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return { results, loading };
}
