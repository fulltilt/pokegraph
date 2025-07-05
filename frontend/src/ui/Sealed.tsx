import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LineChart,
} from "recharts";
import { json } from "../data";
import { TopMoversChart } from "@/components/TopMoversChart";
import React from "react";
import CardSearchInput from "@/components/CardSearchInput";
import useSealedSearch from "@/hooks/useSealedSearch";

type PointData = {
  id: string;
  label: string;
  price: number;
  sealedId: string;
  soldAt: string;
  title: string;
  url: string;
};

const timeframes = [
  { label: "10 Days", value: "10d" },
  { label: "1 Month", value: "1m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

const sealed = [
  "Sword and Shield Base Booster Box",
  "Sword and Shield base Elite Trainer Box set",
  "Rebel Clash Booster Box",
  "Rebel Clash Elite Trainer Box",
  "Darkness Ablaze Booster Box",
  "Darkness Ablaze Elite Trainer Box",
  "Champions Path Elite Trainer Box",
  "Vivid Voltage Booster Box",
  "Vivid Voltage Elite Trainer Box",
  "Shining Fates Elite Trainer Box",
  "Battle Styles Booster Box",
  "Battle Styles Elite Trainer Box Set",
  "Chilling Reign Booster Box",
  "Chilling Reign Elite Trainer Box Set -center",
  "Chilling Reign Pokemon Center Elite Trainer Box Set",
  "Evolving Skies Booster Box",
  "Evolving Skies Elite Trainer Box Set -center",
  "Evolving Skies Pokemon Center Elite Trainer Box Set",
  "Celebrations Elite Trainer Box -center",
  "Celebrations Pokemon Center Elite Trainer Box",
  "Fusion Strike Booster Box",
  "Fusion Strike Elite Trainer Box -center",
  "Fusion Strike Pokemon Center Elite Trainer Box",
  "Brilliant Stars Booster Box",
  "Brilliant Stars Elite Trainer Box -center",
  "Brilliant Stars Pokemon Center Elite Trainer Box",
  "Astral Radiance Booster Box",
  "Astral Radiance Elite Trainer Box -center",
  "Astral Radiance Pokemon Center Elite Trainer Box",
  "Pokemon Go Elite Trainer Box -center",
  "Pokemon Go Pokemon Center Elite Trainer Box",
  "Lost Origin Booster Box",
  "Lost Origin Elite Trainer Box -center",
  "Lost Origin Pokemon Center Elite Trainer Box",
  "Silver Tempest Booster Box",
  "Silver Tempest Elite Trainer Box -center",
  "Silver Tempest Pokemon Center Elite Trainer Box",
  "Crown Zenith Elite Trainer Box -center",
  "Crown Zenith Pokemon Center Elite Trainer Box",
  "Scarlet Violet Base Booster Box",
  "Scarlet Violet Base Elite Trainer Box Set -center",
  "Scarlet Violet Base Pokemon Center Elite Trainer Box Set",
  "Paldea Evolved Booster Box",
  "Paldea Evolved Elite Trainer Box -center",
  "Paldea Evolved Pokemon Center Elite Trainer Box",
  "Obsidian Flames Booster Box",
  "Obsidian Flames Elite Trainer Box -center",
  "Obsidian Flames Pokemon Center Elite Trainer Box",
  "151 Elite Trainer Box -center",
  "151 Pokemon Center Elite Trainer Box",
  "Paradox Rift Booster Box",
  "Paradox Rift Elite Trainer Box -center",
  "Paradox Rift Pokemon Center Elite Trainer Box",
  "Paldean Fates Elite Trainer Box -center",
  "Paldean Fates Pokemon Center Elite Trainer Box",
  "Temporal Forces Booster Box",
  "Temporal Forces Elite Trainer Box Set -center",
  "Temporal Forces Pokemon Center Elite Trainer Box Set",
  "Twilight Masquerade Booster Box",
  "Twilight Masquerade Elite Trainer Box -center",
  "Twilight Masquerade Pokemon Center Elite Trainer Box",
  "Shrouded Fable Elite Trainer Box -center",
  "Shrouded Fable Pokemon Center Elite Trainer Box",
  "Stellar Crown Booster Box",
  "Stellar Crown Elite Trainer Box -center",
  "Stellar Crown Pokemon Center Elite Trainer Box",
  "Surging Sparks Booster Box",
  "Surging Sparks Elite Trainer Box -center",
  "Surging Sparks Elite Pokemon Center Trainer Box",
  "Prismatic Evolutions Elite Trainer Box -center",
  "Prismatic Evolutions Pokemon Center Elite Trainer Box",
  "Journey Together Booster Box",
  "Journey Together Elite Trainer Box -center",
  "Journey Together Pokemon Center Elite Trainer Box",
];

export default function Sealed() {
  const [product, setProduct] = useState("");
  const [range, setRange] = useState("all");
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null);

  const [timeframe, setTimeframe] = useState<"10d" | "1m" | "3m" | "6m" | "1y">(
    "10d"
  );

  const { data: prices, isLoading, error } = useSealedSearch(product, range);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sealed Product Price History</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {/* <CardSearchInput /> */}
        {/* <Input
          placeholder="Enter product name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        /> */}
        <Select value={product} onValueChange={setProduct}>
          <SelectTrigger className="w-[450px]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {sealed.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* <Button onClick={fetchPrices} disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch"}
        </Button> */}
      </div>

      <div className="space-y-4 col-span-4">
        <div className="flex gap-2">
          {(["10d", "1m", "3m", "6m", "1y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded border ${
                timeframe === tf ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="col-span-4 grid grid-cols-2 gap-4"></div>
      </div>

      {prices && prices.length > 0 ? (
        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Price History</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={prices.map((p) => ({
                    ...p,
                    soldAt: new Date(p.soldAt).toLocaleDateString(),
                  }))}
                >
                  <XAxis dataKey="soldAt" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;

                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <div>Price: ${d.price}</div>
                          <div>Date: {d.soldAt}</div>
                          <div>
                            Id: <a href={`${d.url}`}>{d.id}</a>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    activeDot={{
                      onClick: (e: any, props: any) => {
                        const { payload } = props;
                        setSelectedPoint(payload);
                      },
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-4">Price Table</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-2">
                        {new Date(p.soldAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">${p.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>No Results</p>
      )}

      {/* <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <XAxis dataKey="date" />
          <YAxis
            yAxisId="left"
            label={{
              value: "Quantity Sold",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Market Price ($)",
              angle: -90,
              position: "insideRight",
            }}
          />
          <Tooltip />
          <Legend />
          <CartesianGrid stroke="#f5f5f5" />
          <Bar
            yAxisId="left"
            dataKey="quantitySold"
            barSize={20}
            fill="#8884d8"
            name="Quantity Sold"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="marketPrice"
            stroke="#ff7300"
            name="Market Price"
          />
        </ComposedChart>
      </ResponsiveContainer> */}

      <Dialog
        open={!!selectedPoint}
        onOpenChange={() => setSelectedPoint(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div>
            <a href={`${selectedPoint?.url}`} target="_blank">
              ID: {selectedPoint?.id}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
