import { useQuery } from "@tanstack/react-query";

interface PriceEntry {
  id: number;
  price: number;
  soldAt: string;
}

export default function useSealedSearch(product: string, range: string) {
  return useQuery<PriceEntry[]>({
    queryKey: ["sealedPrices", product, range],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/${encodeURIComponent(
          product
        )}/prices?range=${range}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch sealed prices");
      }
      return res.json();
    },
    enabled: !!product && !!range, // only run when both are defined
  });
}
