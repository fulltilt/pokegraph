import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type Movers = {
  card_id: string;
  card_name: string;
  early_price: number;
  recent_price: number;
  percent_change: string;
  image: string;
  release_date: string;
  set_id: string;
  set_name: string;
};

export function TopMoversChart({ url = "", order = "", range = "10d" }) {
  const [data, setData] = useState<Movers[]>([]);
  const [min, setMin] = useState(-Infinity);
  const [max, setMax] = useState(Infinity);

  useEffect(() => {
    fetch(`${url}/${order}?timeframe=${range}`)
      .then((res) => res.json())
      .then(async (cards: Movers[]) => {
        const percentageChanges = cards.map(
          (d) => parseFloat(d.percent_change) ?? 0
        );
        const dataMin = Math.min(...percentageChanges);
        const dataMax = Math.max(...percentageChanges);
        setMin(dataMin);
        setMax(dataMax);

        setData(cards.filter((data) => data.percent_change !== "0"));
      });
  }, [url, range]);

  return (
    <div className="p-4 w-full h-full">
      <h2 className="text-xl font-bold mb-4">
        Top {order === "DESC" ? "Gainers" : "Losers"} by Set
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data.sort(
            (a, b) =>
              new Date(a.release_date).getTime() -
              new Date(b.release_date).getTime()
          )}
        >
          <XAxis dataKey="name" hide />
          {order === "DESC" ? (
            <YAxis domain={[0, max + 10]} />
          ) : (
            <YAxis
              domain={[min, 0]} // y-axis starts at highest negative value and ends at 0
              tickFormatter={(value) => `${value}%`}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white p-2 border rounded shadow">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-16 h-auto mb-2 m-auto"
                  />
                  <div>
                    <strong>{d.card_name}</strong>
                  </div>
                  <div>{d.set_name}</div>
                  <div>Prev: ${d.early_price}</div>
                  <div>Current: ${d.recent_price}</div>
                  <div>
                    Change:&nbsp;
                    {d.percent_change != null
                      ? Number(d.percent_change).toFixed(2) + "%"
                      : "N/A"}
                  </div>
                </div>
              );
            }}
          />
          {order === "ASC" && <ReferenceLine y={0} stroke="#000" />}
          <Bar
            dataKey="percent_change"
            fill={order === "DESC" ? "#22c55e" : "#ef4444"}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={order === "DESC" ? "#22c55e" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
