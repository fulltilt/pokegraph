import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Zap } from "lucide-react";
import useQuantitySpikes from "@/hooks/useQuantitySpikes";

interface QuantitySpike {
  cardId: string;
  card_name: string;
  set_name: string;
  date: string;
  spike_quantity: number;
  normal_avg_quantity: string;
  z_score_30d: string;
  z_score_7d: string;
  pct_above_normal: string;
  spike_day_price: number | null;
  prev_day_price: number | null;
  spike_severity: "extreme_spike" | "major_spike" | "moderate_spike" | "normal";
}

type SeverityConfig = {
  className: string;
  label: string;
};

const QuantitySpikesTable = () => {
  const { data: spikes, isLoading, isError, error } = useQuantitySpikes();

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, SeverityConfig> = {
      extreme_spike: {
        className: "bg-red-100 text-red-800 border-red-300",
        label: "Extreme",
      },
      major_spike: {
        className: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Major",
      },
      moderate_spike: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Moderate",
      },
      normal: {
        className: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Normal",
      },
    };

    const config = variants[severity] || variants.normal;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        <Zap className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: string) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    });
  };

  const formatPercentage = (pct: string) => {
    return `${parseFloat(pct).toFixed(1)}%`;
  };

  const parseSetName = (setNameJson: string) => {
    try {
      const setData = JSON.parse(setNameJson);
      return setData.name || "Unknown Set";
    } catch {
      return setNameJson || "Unknown Set";
    }
  };

  const getPriceChange = (currentPrice: number, prevPrice: number) => {
    if (!currentPrice || !prevPrice) return null;
    const change = ((currentPrice - prevPrice) / prevPrice) * 100;
    const isPositive = change > 0;
    return (
      <span
        className={`flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        <TrendingUp className={`w-3 h-3 ${isPositive ? "" : "rotate-180"}`} />
        {isPositive ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading quantity spikes...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            Error loading data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h1 className="text-xl font-bold">Pokemon Card Quantity Spikes</h1>
          <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
            Last 3 Days
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Cards with significant increases in trading volume compared to their
          historical averages
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Card
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Spike Qty
                </th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Normal Avg
                </th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  % Above Normal
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Z-Score (30d)
                </th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Price Change
                </th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {spikes.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                  >
                    No quantity spikes found in the last 3 days
                  </td>
                </tr>
              ) : (
                spikes.map((spike: QuantitySpike) => (
                  <tr
                    key={`${spike.cardId}-${spike.date}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border border-gray-200 px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {spike.card_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {spike.cardId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {parseSetName(spike.set_name)}
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm">
                          {formatDate(spike.date)}
                        </span>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                        {spike.spike_quantity}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-mono text-gray-600">
                      {spike.normal_avg_quantity}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right">
                      <span className="font-semibold text-orange-600">
                        +{formatPercentage(spike.pct_above_normal)}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border font-mono ${
                          parseFloat(spike.z_score_30d) >= 10
                            ? "bg-red-100 text-red-800 border-red-300"
                            : parseFloat(spike.z_score_30d) >= 5
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }`}
                      >
                        {spike.z_score_30d}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono">
                          {formatPrice(String(spike.spike_day_price))}
                        </span>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right">
                      {getPriceChange(
                        spike.spike_day_price ?? 0,
                        spike.prev_day_price ?? 0
                      ) || <span className="text-gray-400">N/A</span>}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      {getSeverityBadge(spike.spike_severity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {spikes.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  Z-Score
                </span>
                <span>
                  Statistical measure of how unusual the spike is (higher = more
                  unusual)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  % Above Normal
                </span>
                <span>
                  Percentage increase compared to 30-day rolling average
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  Severity
                </span>
                <span>
                  Based on Z-Score: 3+ Extreme, 2+ Major, 1.5+ Moderate
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Updated: {new Date().toLocaleString()}</span>
          <span>Showing spikes from the last 3 days</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantitySpikesTable;
