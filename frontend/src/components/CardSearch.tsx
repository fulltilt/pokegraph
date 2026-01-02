// src/components/CardSearch.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  Image as ImageIcon,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Save,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";

interface CardData {
  id: string;
  data: {
    name: string;
    type?: string;
    set?: {
      name: string;
    };
    images: {
      small: string;
    };
    setName?: string;
    number?: string;
    rarity?: string;
    [key: string]: any;
  };
  tcgPlayerId?: string;
}

interface SelectedCard extends CardData {
  quantity: number;
}

async function searchCards(query: string): Promise<CardData[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    `/api/cards/search?q=${encodeURIComponent(query)}&limit=20`
  );

  if (!res.ok) throw new Error("Search failed");

  const data = await res.json();
  return data.cards || [];
}

async function getGoogleAuthUrl() {
  const res = await fetch("/api/cards/auth-url");
  const data = await res.json();
  return data.authUrl;
}

async function exportToGoogleSheets(
  cards: SelectedCard[],
  accessToken: string,
  refreshToken?: string,
  spreadsheetId?: string
) {
  const res = await fetch("/api/cards/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards, accessToken, refreshToken, spreadsheetId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Export failed");
  }

  return res.json();
}

export default function CardSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState("");

  // Listen for OAuth callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        const tokens = event.data.tokens;
        setAccessToken(tokens.access_token);

        // Store tokens with expiry time
        const expiryTime = Date.now() + (tokens.expires_in || 3600) * 1000;
        localStorage.setItem("google_access_token", tokens.access_token);
        localStorage.setItem("google_token_expiry", expiryTime.toString());

        if (tokens.refresh_token) {
          localStorage.setItem("google_refresh_token", tokens.refresh_token);
          setRefreshToken(tokens.refresh_token);
        }

        toast({
          title: "Connected to Google",
          description: "You can now export to Google Sheets",
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Check for existing tokens and validate expiry
    const storedAccess = localStorage.getItem("google_access_token");
    const storedRefresh = localStorage.getItem("google_refresh_token");
    const expiryTime = localStorage.getItem("google_token_expiry");

    // If token exists but is expired, clear it
    if (storedAccess && expiryTime) {
      if (Date.now() > parseInt(expiryTime)) {
        console.log("Access token expired, clearing...");
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_token_expiry");
      } else {
        setAccessToken(storedAccess);
      }
    }

    if (storedRefresh) setRefreshToken(storedRefresh);

    return () => window.removeEventListener("message", handleMessage);
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: cards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", debouncedQuery],
    queryFn: () => searchCards(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000,
  });

  const exportMutation = useMutation({
    mutationFn: async ({
      cards,
      spreadsheetId,
    }: {
      cards: SelectedCard[];
      spreadsheetId?: string;
    }) => {
      if (!accessToken) {
        // Open OAuth popup
        const authUrl = await getGoogleAuthUrl();
        window.open(authUrl, "Google Auth", "width=600,height=600");
        throw new Error("Please authenticate with Google first");
      }
      return exportToGoogleSheets(
        cards,
        accessToken,
        refreshToken || undefined,
        spreadsheetId
      );
    },
    onSuccess: (data) => {
      // Update access token if refreshed
      if (data.newAccessToken) {
        setAccessToken(data.newAccessToken);
        localStorage.setItem("google_access_token", data.newAccessToken);
        // Update expiry time (tokens typically last 1 hour)
        const expiryTime = Date.now() + 3600 * 1000;
        localStorage.setItem("google_token_expiry", expiryTime.toString());
      }

      setShowExportDialog(false);
      setExistingSpreadsheetId("");

      toast("Export successful!", {
        description: "Google Sheet created successfully",
      });
      // Open the sheet
      window.open(data.url, "_blank");
    },
    onError: (error: Error) => {
      // If token expired, clear and prompt re-auth
      if (
        error.message.includes("authentication") ||
        error.message.includes("token")
      ) {
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_refresh_token");
        setAccessToken(null);
        setRefreshToken(null);
      }

      toast(
        error.message.includes("authenticate")
          ? "Authentication required"
          : "Export failed",
        {
          description: error.message.includes("authenticate")
            ? "A popup window will open for Google sign-in"
            : "Failed to create Google Sheet",
          // variant: error.message.includes('authenticate') ? "default" : "destructive",
        }
      );
    },
  });

  const toggleCard = (card: CardData) => {
    setSelectedCards((prev) => {
      const existing = prev.find((c) => c.id === card.id);
      if (existing) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, { ...card, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (cardId: string, delta: number) => {
    setSelectedCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, quantity: Math.max(1, card.quantity + delta) }
          : card
      )
    );
  };

  const removeCard = (cardId: string) => {
    setSelectedCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleExportConfirm = (useExisting: boolean) => {
    exportMutation.mutate({
      cards: selectedCards,
      spreadsheetId: useExisting ? existingSpreadsheetId : undefined,
    });
  };

  const isSelected = (cardId: string) =>
    selectedCards.some((c) => c.id === cardId);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Cart */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Card Search</h1>
          <p className="text-muted-foreground">
            Search and select cards to export to Google Sheets
          </p>
        </div>
        <Button
          onClick={() => setShowCart(!showCart)}
          variant="outline"
          className="relative"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart ({selectedCards.length})
          {selectedCards.length > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {selectedCards.reduce((sum, c) => sum + c.quantity, 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cards by name..."
          className="pl-9 pr-9 h-12 text-base"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Cart Panel */}
      {showCart && selectedCards.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Selected Cards</h2>
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              size="sm"
            >
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Export to Google Sheets
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <img
                  src={card.data.images.small}
                  alt={card.data.name}
                  className="w-12 h-16 object-contain rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {card.data.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.data.set?.name}
                    {card.data.number && ` #${card.data.number}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(card.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {card.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(card.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeCard(card.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results Count */}
      {debouncedQuery && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Searching..."
              : `${cards.length} result${cards.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to search cards. Please try again.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {cards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {cards.map((card) => {
            const selected = isSelected(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleCard(card)}
                className="group cursor-pointer"
              >
                <div
                  className={`overflow-hidden rounded-lg h-full flex flex-col ${
                    selected ? "ring-2 ring-primary shadow-md" : ""
                  }`}
                >
                  <div className="relative aspect-[5/7] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
                    {card.data.images ? (
                      <img
                        src={card.data.images.small}
                        alt={card.data.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* {card.data.rarity && (
                      <Badge
                        variant="secondary"
                        className="absolute top-1.5 right-1.5 text-xs bg-background/90 backdrop-blur"
                      >
                        {card.data.rarity}
                      </Badge>
                    )} */}
                    {selected && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Badge className="bg-primary">
                          <Plus className="h-3 w-3 mr-1" />
                          Added
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between bg-background">
                    {/* <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
                      {card.data.name}
                    </h3> */}
                    <div className="space-y-1.5">
                      {card.data.type && (
                        <div className="text-xs text-muted-foreground">
                          {card.data.type}
                        </div>
                      )}
                      {(card.data.setName || card.data.set) && (
                        <div className="text-xs text-muted-foreground font-medium">
                          {card.data.set?.name}
                          {` #${card.data.number}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {debouncedQuery && !isLoading && cards.length === 0 && !isError && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cards found</h3>
          <p className="text-muted-foreground">
            No cards match "{debouncedQuery}". Try a different search term.
          </p>
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Google Sheets</DialogTitle>
            <DialogDescription>
              Choose whether to create a new spreadsheet or update an existing
              one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Existing Spreadsheet ID (optional)
              </label>
              <Input
                placeholder="Paste spreadsheet ID from URL"
                value={existingSpreadsheetId}
                onChange={(e) => setExistingSpreadsheetId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create a new spreadsheet. Or paste the ID from an
                existing sheet's URL.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleExportConfirm(false)}
              disabled={exportMutation.isPending}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Create New
            </Button>
            {existingSpreadsheetId && (
              <Button
                onClick={() => handleExportConfirm(true)}
                disabled={exportMutation.isPending}
              >
                Update Existing
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initial State */}
      {!debouncedQuery && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Start searching</h3>
          <p className="text-muted-foreground">
            Enter a card name to find cards in your collection
          </p>
        </div>
      )}
    </div>
  );
}
