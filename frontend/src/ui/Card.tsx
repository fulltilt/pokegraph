import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { DBCard } from "@/types";
import CardPriceHistoryChart from "@/components/CardPriceHistoryChart";
import { TimeframeTabs } from "@/components/TimeframeTabs";

const TIMEFRAMES = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

export default function Card() {
  const { id } = useParams();

  const [timeframe, setTimeframe] = useState("1m");

  const [card, setCard] = useState<DBCard | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/cards/card/${id}`)
      .then((res) => res.json())
      .then(setCard);
  }, [id]);

  if (!card) return <p>Loading...</p>;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 sm:p-6">
      <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 text-center shadow-lg shadow-black/5 backdrop-blur">
          <img
            src={card.data.images.small}
            alt={card.data.name}
            className="mx-auto mb-4 w-64 max-w-full"
          />
          <h2 className="text-2xl font-semibold tracking-tight">
            {card.data.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {card.data.set.name}
          </p>
          <div className="mt-6 flex justify-center">
            <TimeframeTabs
              options={TIMEFRAMES}
              value={timeframe}
              onChange={setTimeframe}
            />
          </div>
        </div>

        <div>
          <CardPriceHistoryChart cardId={card.id} timeframe={timeframe} />
        </div>
      </section>
    </div>
  );
}
