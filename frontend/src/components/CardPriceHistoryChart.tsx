import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  TooltipProps,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

type PriceHistory = {
  start: Date;
  end: Date;
  date: string;
  price: number;
  quantity: number;
};

type Bucket = {
  start: Date;
  end: Date;
  date: string;
  price: number;
  quantity: number;
};

function getEvenlySpacedTicks(dates: string[], tickCount: number) {
  if (dates.length <= tickCount) return dates;
  const step = Math.floor(dates.length / (tickCount - 1));
  return dates.filter((_, idx) => idx % step === 0);
}

// function normalizePriceData(
//   data: PriceHistory[],
//   numberOfBuckets: number = 50
// ): Bucket[] {
//   //   if (!data.length) return [];

//   //   // Parse and sort data by date
//   //   const sortedData = [...data].sort(
//   //     (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//   //   );

//   //   const startDate = new Date(sortedData[0].date);
//   //   const endDate = new Date(sortedData[sortedData.length - 1].date);

//   //   const bucketDuration =
//   //     (endDate.getTime() - startDate.getTime()) / numberOfBuckets;

//   //   const buckets: Bucket[] = [];

//   //   for (let i = 0; i < numberOfBuckets; i++) {
//   //     const bucketStart = new Date(startDate.getTime() + i * bucketDuration);
//   //     const bucketEnd = new Date(startDate.getTime() + (i + 1) * bucketDuration);

//   //     const bucketData = sortedData.filter(
//   //       (entry) =>
//   //         new Date(entry.date) >= bucketStart && new Date(entry.date) < bucketEnd
//   //     );

//   //     const totalQuantity = bucketData.reduce((sum, d) => sum + d.quantity, 0);
//   //     const averagePrice =
//   //       bucketData.length > 0
//   //         ? bucketData.reduce((sum, d) => sum + d.price * d.quantity, 0) /
//   //           totalQuantity
//   //         : 0;

//   //     buckets.push({
//   //       start: bucketStart,
//   //       end: bucketEnd,
//   //       date: bucketStart.toISOString(),
//   //       price: parseFloat(averagePrice.toFixed(2)),
//   //       quantity: totalQuantity,
//   //     });
//   //   }

//   //   return buckets;
//   if (!data.length) return [];

//   const sortedData = [...data].sort(
//     (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//   );

//   const totalPoints = sortedData.length;
//   const pointsPerBucket = Math.ceil(totalPoints / numberOfBuckets);

//   const buckets: Bucket[] = [];

//   for (let i = 0; i < totalPoints; i += pointsPerBucket) {
//     const chunk = sortedData.slice(i, i + pointsPerBucket);

//     const bucketStart = new Date(chunk[0].date);
//     const bucketEnd = new Date(chunk[chunk.length - 1].date);

//     const totalQuantity = chunk.reduce((sum, d) => sum + d.quantity, 0);
//     const averagePrice =
//       totalQuantity > 0
//         ? chunk.reduce((sum, d) => sum + d.price * d.quantity, 0) /
//           totalQuantity
//         : 0;

//     buckets.push({
//       start: bucketStart,
//       end: bucketEnd,
//       date: bucketStart.toISOString(), // or use a range label
//       price: parseFloat(averagePrice.toFixed(2)),
//       quantity: totalQuantity,
//     });
//   }

//   return buckets;
// }

function normalizePriceData(
  data: PriceHistory[],
  targetBuckets: number = 50
): Bucket[] {
  if (!data.length) return [];

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedData[0].date);
  const endDate = new Date(sortedData[sortedData.length - 1].date);
  const totalDuration = endDate.getTime() - startDate.getTime();

  // Adjust bucket size so that each contains data
  const minTimeGap = totalDuration / targetBuckets;

  const buckets: Bucket[] = [];

  let currentBucketStart = new Date(startDate);
  let currentBucketEnd = new Date(currentBucketStart.getTime() + minTimeGap);

  while (currentBucketStart < endDate) {
    const bucketData = sortedData.filter((entry) => {
      const time = new Date(entry.date).getTime();
      return (
        time >= currentBucketStart.getTime() &&
        time < currentBucketEnd.getTime()
      );
    });

    const totalQuantity = bucketData.reduce((sum, d) => sum + d.quantity, 0);
    const averagePrice =
      totalQuantity > 0
        ? bucketData.reduce((sum, d) => sum + d.price * d.quantity, 0) /
          totalQuantity
        : 0;

    // Only push non-empty buckets
    if (bucketData.length > 0) {
      buckets.push({
        start: new Date(currentBucketStart),
        end: new Date(currentBucketEnd),
        date: currentBucketStart.toISOString(),
        price: parseFloat(averagePrice.toFixed(2)),
        quantity: totalQuantity,
      });
    }

    currentBucketStart = currentBucketEnd;
    currentBucketEnd = new Date(currentBucketStart.getTime() + minTimeGap);
  }

  return buckets;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length > 0) {
    const { start, end, price, quantity } = payload[0].payload;
    return (
      <div className="p-2 bg-white border rounded shadow text-sm">
        <p>
          <strong>Date Range:</strong> {start.toLocaleDateString("en")} –{" "}
          {end.toLocaleDateString("en")}
        </p>
        <p>
          <strong>Avg Price:</strong> ${price?.toFixed(2) ?? "N/A"}
        </p>
        <p>
          <strong>Sales:</strong> {quantity}
        </p>
      </div>
    );
  }
  return null;
};

const CardPriceHistoryChart = ({
  cardId,
  timeframe,
}: {
  cardId: string;
  timeframe: string;
}) => {
  const { data, isLoading } = useQuery<PriceHistory[]>({
    queryKey: ["card-history", cardId, timeframe],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ENDPOINT_URL
        }/api/card/history/${cardId}?timeframe=${timeframe}`
      );
      if (!res.ok) throw new Error("Failed to fetch card history");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading chart...</div>;
  console.log(data);
  return (
    <ResponsiveContainer width="70%" height={400} className="m-auto">
      <ComposedChart data={data ? normalizePriceData(data) : []}>
        <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
        {/* <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString("en-US")}
          ticks={getEvenlySpacedTicks(data?.map((d) => d.date) || [], 5)}
        />
         */}
        <XAxis
          dataKey="start"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })
          }
          interval="preserveStartEnd"
          ticks={
            data?.length
              ? data
                  .filter((b) => b.start)
                  .map((b) => b.start.toString())
                  .filter((_, i) => i % Math.ceil(data.length / 5) === 0)
              : []
          }
        />
        <YAxis
          yAxisId="left"
          label={{ value: "Sales", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Price ($)", angle: 90, position: "insideRight" }}
        />
        <Tooltip
          //   labelFormatter={(value) =>
          //     new Date(value).toLocaleDateString("en-US")
          //   }
          content={<CustomTooltip />}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="quantity"
          fill="#8884d8"
          name="Sales Volume"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="price"
          stroke="#82ca9d"
          name="Avg Price"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CardPriceHistoryChart;
