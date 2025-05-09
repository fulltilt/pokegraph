import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DBCard } from "@/types";
import CardPriceHistoryChart from "@/components/CardPriceHistoryChart";

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
    fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/cards/${id}`)
      .then((res) => res.json())
      .then(setCard);
  }, [id]);

  if (!card) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <img
        src={card.data.images.small}
        alt={card.data.name}
        className="w-64 mx-auto mb-4"
      />
      <h2 className="text-xl font-bold text-center">{card.data.name}</h2>
      <p className="text-center">{card.data.set.name}</p>

      {card && <CardPriceHistoryChart cardId={card.id} timeframe={timeframe} />}
      <div className="flex justify-center gap-3 mt-6">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 border rounded-md text-sm ${
              tf.value === timeframe
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
