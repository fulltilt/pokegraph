import { useQuery } from "@tanstack/react-query";

// interface QuantitySpike {
//   cardId: string;
//   card_name: string;
//   set_name: string;
//   date: string;
//   spike_quantity: number;
//   normal_avg_quantity: string;
//   z_score_30d: string;
//   z_score_7d: string;
//   pct_above_normal: string;
//   spike_day_price: number | null;
//   prev_day_price: number | null;
//   spike_severity: "extreme_spike" | "major_spike" | "moderate_spike" | "normal";
// }

export default function useQuantitySpikes() {
  return useQuery({
    queryKey: ["quantitySpikes"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/quantity-spikes`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch quantity spikes");
      }
      return res.json();
    },
  });
}
