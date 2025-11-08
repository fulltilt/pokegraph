import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Camera,
  Upload,
  X,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = import.meta.env.VITE_ENDPOINT_URL || "";

// Types
interface HealthCheckResponse {
  status: string;
  embeddingService: string;
  database: string;
}

interface CardImage {
  small: string;
  large: string;
}

interface CardPrice {
  market?: number;
  low?: number;
  mid?: number;
  high?: number;
}

interface CardPrices {
  holofoil?: CardPrice;
  normal?: CardPrice;
  reverseHolofoil?: CardPrice;
}

interface CardMatch {
  id: string;
  similarity: number;
  name: string;
  setName: string;
  setId: string;
  number: string;
  rarity: string;
  images: CardImage;
  prices?: CardPrices;
}

interface CardResult {
  cardIndex: number;
  cardSize: { width: number; height: number };
  matchesFound: number;
  matches: CardMatch[];
}

interface RecognitionResponse {
  success: boolean;
  cardsDetected?: number;
  results?: CardResult[];
  matches?: CardMatch[]; // Legacy single card support
}

export default function CardRecognition() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(0.75);
  const [topK, setTopK] = useState<number>(5);

  // Health check query
  const { data: healthData, isLoading: healthLoading } =
    useQuery<HealthCheckResponse>({
      queryKey: ["health"],
      queryFn: async () => {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      },
      refetchInterval: 30000,
    });

  // Card recognition mutation
  const recognitionMutation = useMutation<RecognitionResponse, Error, File>({
    mutationFn: async (file: File) => {
      console.log("🚀 Starting recognition...");
      const formData = new FormData();
      formData.append("image", file);

      console.log("📤 Sending to:", `${API_BASE_URL}/api/recognize-cards`);

      const res = await fetch(
        `${API_BASE_URL}/api/recognize-cards?topK=${topK}&threshold=${threshold}`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("📥 Response:", res.status, res.ok);

      if (!res.ok) {
        const error = await res.json();
        console.error("❌ Error:", error);
        throw new Error(error.message || "Recognition failed");
      }

      const data = await res.json();
      console.log("✅ Success:", data);
      return data;
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecognize = () => {
    if (!selectedImage) return;
    recognitionMutation.mutate(selectedImage);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    recognitionMutation.reset();
  };

  const isServiceHealthy =
    healthData?.status === "ok" && healthData?.embeddingService === "connected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Card Recognition
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload a card image to find matches in the database
          </p>
        </div>

        {/* Health Status */}
        <Alert
          className={
            isServiceHealthy
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }
        >
          <div className="flex items-center gap-2">
            {healthLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isServiceHealthy ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className="text-sm">
              {healthLoading
                ? "Checking service status..."
                : isServiceHealthy
                ? "All systems operational"
                : "Service partially unavailable"}
            </AlertDescription>
          </div>
        </Alert>

        {/* Upload Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Card Image
            </CardTitle>
            <CardDescription>
              Take a photo or upload an image of a single card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                  capture="environment"
                />
              </label>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Results: {topK}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Threshold: {threshold.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleRecognize}
              disabled={
                !selectedImage ||
                recognitionMutation.isPending ||
                !isServiceHealthy
              }
              className="w-full"
              size="lg"
            >
              {recognitionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Recognize Card
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {recognitionMutation.isError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {recognitionMutation.error?.message || "Failed to recognize card"}
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {recognitionMutation.data?.matches && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Found {recognitionMutation.data.matches.length} Matches
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recognitionMutation.data.matches.map((match) => (
                <Card
                  key={match.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-[5/7] bg-gray-100 relative">
                    <img
                      src={match.images?.large || match.images?.small}
                      alt={match.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/75 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {(match.similarity * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold text-lg truncate">{match.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{match.setName}</p>
                      <p className="flex justify-between">
                        <span>#{match.number}</span>
                        <span className="font-medium">{match.rarity}</span>
                      </p>
                      {match.prices?.holofoil?.market && (
                        <p className="text-green-600 font-bold">
                          ${match.prices.holofoil.market.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Progress value={match.similarity * 100} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recognitionMutation.isSuccess &&
          recognitionMutation.data?.matches?.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No matching cards found. Try adjusting the threshold or
                uploading a clearer image.
              </AlertDescription>
            </Alert>
          )}
      </div>
    </div>
  );
}
