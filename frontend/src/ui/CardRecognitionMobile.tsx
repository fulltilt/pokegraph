import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Camera,
  Upload,
  X,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  FlipHorizontal,
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

interface HealthCheckResponse {
  status: string;
  embeddingService: string;
  database: string;
}

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
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
  detectedCardNumber: number;
  cardSize: { width: number; height: number };
  boundingBox?: BoundingBox;
  matchesFound: number;
  topMatch: {
    name: string;
    similarity: number;
    setName: string;
  } | null;
  matches: CardMatch[];
}

interface RecognitionResponse {
  success: boolean;
  cardsDetected?: number;
  imageSize?: { width: number; height: number };
  results?: CardResult[];
  summary?: Array<{
    cardNumber: number;
    bestMatch: string;
    confidence: string;
    boundingBox?: BoundingBox;
  }>;
  matches?: CardMatch[];
}

export default function CardRecognitionMobile() {
  const [mode, setMode] = useState<"capture" | "upload" | "results">("capture");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(0.75);
  const [topK, setTopK] = useState<number>(5);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [selectedCards, setSelectedCards] = useState<
    Array<{
      name: string;
      price: number | null;
      setName: string;
      number: string;
    }>
  >([]);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Health check
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

  // Recognition mutation
  const recognitionMutation = useMutation<RecognitionResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${API_BASE_URL}/api/recognize-cards?topK=${topK}&threshold=${threshold}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Recognition failed");
      }

      return res.json();
    },
    onSuccess: () => {
      setMode("results");
    },
  });

  // Capture photo from webcam
  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "capture.jpg", {
              type: "image/jpeg",
            });
            setSelectedImage(file);
            setPreviewUrl(imageSrc);
            recognitionMutation.mutate(file);
          });
      }
    }
  }, [recognitionMutation]);

  // Handle file upload
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
        recognitionMutation.mutate(file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Draw bounding boxes
  const drawBoundingBoxes = (imageUrl: string, results: CardResult[]) => {
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        results.forEach((result) => {
          if (!result.boundingBox) return;

          const { x1, y1, x2, y2 } = result.boundingBox;
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 4;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          ctx.fillStyle = "#22c55e";
          ctx.fillRect(x1, y1 - 30, 120, 30);

          ctx.fillStyle = "white";
          ctx.font = "bold 16px sans-serif";
          ctx.fillText(`Card ${result.detectedCardNumber}`, x1 + 5, y1 - 8);
        });
      }
    };
    img.src = imageUrl;
  };

  // Update canvas when results arrive
  useEffect(() => {
    if (recognitionMutation.data?.results && previewUrl) {
      drawBoundingBoxes(previewUrl, recognitionMutation.data.results);
    }
  }, [recognitionMutation.data, previewUrl]);

  // Add card to selection
  const addCardToList = (cardResult: CardResult) => {
    if (!cardResult.topMatch) return;

    const topMatchFull = cardResult.matches[0];
    const price =
      topMatchFull?.prices?.holofoil?.market ||
      topMatchFull?.prices?.normal?.market ||
      null;

    const newCard = {
      name: cardResult.topMatch.name,
      price: price,
      setName: cardResult.topMatch.setName,
      number: topMatchFull.number,
    };

    const isDuplicate = selectedCards.some(
      (card) => card.name === newCard.name && card.setName === newCard.setName,
    );

    if (!isDuplicate) {
      setSelectedCards([...selectedCards, newCard]);
    }
  };

  const removeCardFromList = (index: number) => {
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
  };

  const exportToCSV = () => {
    if (selectedCards.length === 0) return;

    const headers = ["Card Name", "Set", "Number", "Market Price"];
    const rows = selectedCards.map((card) => [
      card.name,
      card.setName,
      card.number,
      card.price ? `${card.price.toFixed(2)}` : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `card-list-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalValue = selectedCards.reduce(
    (sum, card) => sum + (card.price || 0),
    0,
  );

  const isServiceHealthy =
    healthData?.status === "ok" && healthData?.embeddingService === "connected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Card Recognition
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Scan cards with your camera or upload images
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
            <AlertDescription className="text-xs sm:text-sm">
              {healthLoading
                ? "Checking service status..."
                : isServiceHealthy
                  ? "All systems operational"
                  : "Service partially unavailable"}
            </AlertDescription>
          </div>
        </Alert>

        {/* Camera/Upload Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Camera className="h-5 w-5" />
              Capture Card
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Use camera or upload image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Tabs */}
            <div className="flex gap-2">
              <Button
                variant={mode === "capture" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("capture")}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={mode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("upload")}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            {/* Camera Mode */}
            {mode === "capture" && (
              <div className="space-y-4">
                <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-[4/5]">
                  {!previewUrl ? (
                    <Webcam
                      ref={webcamRef}
                      facingMode={facingMode}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCapture}
                    disabled={
                      !!previewUrl ||
                      recognitionMutation.isPending ||
                      !isServiceHealthy
                    }
                    size="lg"
                    className="flex-1"
                  >
                    {recognitionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setFacingMode(
                        facingMode === "environment" ? "user" : "environment",
                      )
                    }
                    className="px-3"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {previewUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedImage(null);
                      recognitionMutation.reset();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {mode === "upload" && (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
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
                <label className="text-xs font-medium text-gray-700">
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

            {/* Error Alert */}
            {recognitionMutation.isError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs sm:text-sm text-red-800">
                  {recognitionMutation.error?.message ||
                    "Failed to recognize card"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {mode === "results" && recognitionMutation.data && (
          <div className="space-y-4">
            {/* Summary */}
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs sm:text-sm text-blue-800">
                {recognitionMutation.data.cardsDetected ? (
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Detected {recognitionMutation.data.cardsDetected} card(s)
                    </p>
                    {recognitionMutation.data.summary && (
                      <div className="text-xs mt-2 space-y-1">
                        {recognitionMutation.data.summary.map((s) => (
                          <div
                            key={s.cardNumber}
                            className="flex justify-between"
                          >
                            <span>Card {s.cardNumber}:</span>
                            <span className="font-medium">
                              {s.bestMatch} ({s.confidence})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  `Found ${
                    recognitionMutation.data.matches?.length || 0
                  } matches`
                )}
              </AlertDescription>
            </Alert>

            {/* Multi-card Results */}
            {recognitionMutation.data.results?.map((cardResult) => (
              <Card key={cardResult.cardIndex}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg">
                    Card #{cardResult.detectedCardNumber}
                  </CardTitle>
                  {cardResult.topMatch && (
                    <div className="text-sm">
                      <p className="text-gray-600">Best Match</p>
                      <p className="font-semibold">
                        {cardResult.topMatch.name}
                      </p>
                      <p className="text-green-600 font-bold">
                        {(cardResult.topMatch.similarity * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cardResult.matches.slice(0, 6).map((match, idx) => (
                      <button
                        key={match.id}
                        onClick={() => addCardToList(cardResult)}
                        className="flex flex-col items-center space-y-1 p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="relative w-full aspect-[5/7] bg-gray-200 rounded overflow-hidden">
                          <img
                            src={match.images?.small}
                            alt={match.name}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-1 right-1">
                            <div
                              className={`text-xs font-bold px-1 py-0.5 rounded ${
                                idx === 0
                                  ? "bg-green-600 text-white"
                                  : "bg-black/50 text-white"
                              }`}
                            >
                              {(match.similarity * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold truncate text-center">
                          {match.name}
                        </p>
                        {match.prices?.holofoil?.market && (
                          <p className="text-xs font-bold text-green-600">
                            ${match.prices.holofoil.market.toFixed(2)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Selected Cards */}
            {selectedCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex justify-between">
                    <span>Selected ({selectedCards.length})</span>
                    <span className="text-green-600">
                      ${totalValue.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div>
                        <p className="font-semibold">{card.name}</p>
                        <p className="text-xs text-gray-600">
                          {card.setName} #{card.number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-green-600">
                          ${card.price?.toFixed(2) || "N/A"}
                        </p>
                        <button
                          onClick={() => removeCardFromList(idx)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={exportToCSV}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <Upload className="h-3 w-3 mr-2" />
                    Export CSV
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Go Back Button */}
            <Button
              variant="outline"
              onClick={() => {
                setMode("capture");
                setPreviewUrl(null);
                setSelectedImage(null);
                recognitionMutation.reset();
              }}
              className="w-full"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Scan Another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
