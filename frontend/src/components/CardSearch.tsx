// src/components/CardSearch.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  Image as ImageIcon,
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
      releaseDate?: string;
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

interface CardSearchResponse {
  cards: CardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const SEARCH_PAGE_SIZE = 120;

async function searchCards(
  query: string,
  page: number,
): Promise<CardSearchResponse> {
  if (!query.trim()) {
    return {
      cards: [],
      total: 0,
      page,
      pageSize: SEARCH_PAGE_SIZE,
      totalPages: 0,
    };
  }

  const res = await fetch(
    `/api/cards/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${SEARCH_PAGE_SIZE}`,
  );

  if (!res.ok) throw new Error("Search failed");

  return (await res.json()) as CardSearchResponse;
}

async function getGoogleAuthUrl() {
  const res = await fetch("/api/cards/auth-url");
  const data = await res.json();
  return data.authUrl;
}

async function openGoogleAuthPopup() {
  const authUrl = await getGoogleAuthUrl();
  window.open(authUrl, "Google Auth", "width=600,height=600");
}

async function exportToGoogleSheets(
  cards: SelectedCard[],
  accessToken?: string,
  refreshToken?: string,
  spreadsheetId?: string,
) {
  const res = await fetch("/api/cards/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cards,
      accessToken: accessToken ?? "",
      refreshToken,
      spreadsheetId,
    }),
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState("");

  // Load saved spreadsheet ID on mount
  useEffect(() => {
    const savedSpreadsheetId = localStorage.getItem("last_spreadsheet_id");
    if (savedSpreadsheetId) {
      setExistingSpreadsheetId(savedSpreadsheetId);
    }
  }, []);

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

        toast("Connected to Google", {
          description: "You can now export to Google Sheets",
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Load saved tokens. Keep access token even if expired so backend can use refresh token.
    const storedAccess = localStorage.getItem("google_access_token");
    const storedRefresh = localStorage.getItem("google_refresh_token");

    if (storedAccess) setAccessToken(storedAccess);

    if (storedRefresh) setRefreshToken(storedRefresh);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    data: searchResult,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", debouncedQuery, currentPage],
    queryFn: () => searchCards(debouncedQuery, currentPage),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000,
  });

  const cards = searchResult?.cards ?? [];
  const totalResults = searchResult?.total ?? 0;
  const totalPages = searchResult?.totalPages ?? 0;

  const exportMutation = useMutation({
    mutationFn: async ({
      cards,
      spreadsheetId,
    }: {
      cards: SelectedCard[];
      spreadsheetId?: string;
    }) => {
      if (!accessToken && !refreshToken) {
        await openGoogleAuthPopup();
        throw new Error("Please authenticate with Google first");
      }

      return exportToGoogleSheets(
        cards,
        accessToken || undefined,
        refreshToken || undefined,
        spreadsheetId,
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

      // Save the spreadsheet ID (whether new or existing)
      if (data.spreadsheetId) {
        localStorage.setItem("last_spreadsheet_id", data.spreadsheetId);
        setExistingSpreadsheetId(data.spreadsheetId);
      }

      setShowExportDialog(false);

      toast("Export successful!", {
        description: "Google Sheet created successfully",
      });

      // Open the sheet with range parameter to scroll to last row
      // let urlToOpen = data.url;
      // if (data.lastRow && data.sheetId !== undefined) {
      //   // Use rangeid parameter which forces Google Sheets to scroll and select
      //   const cellRange = `Cards!A${data.lastRow}`;
      //   urlToOpen = `${data.url}#gid=${data.sheetId}&range=${cellRange}`;
      // }
      // window.open(urlToOpen, "_blank");
    },
    onError: (error: Error) => {
      // If token expired, clear and prompt re-auth
      if (
        error.message.includes("authentication") ||
        error.message.includes("token")
      ) {
        const hasRefreshToken = Boolean(
          refreshToken || localStorage.getItem("google_refresh_token"),
        );

        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_token_expiry");
        setAccessToken(null);

        if (hasRefreshToken) {
          toast("Session expired", {
            description:
              "Your next export will automatically refresh in the background.",
          });
        } else {
          openGoogleAuthPopup().catch((popupError) => {
            console.error("Failed to open Google auth popup:", popupError);
          });

          toast("Session expired", {
            description:
              "Please reauthenticate in the popup. You can stay on this screen.",
          });
        }

        return;
      }

      if (error.message.includes("authenticate")) {
        toast("Authentication required", {
          description:
            "Please sign in with Google in the popup. You can stay on this screen.",
        });

        return;
      }

      toast("Export failed", {
        description: "Failed to create Google Sheet",
      });
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
          : card,
      ),
    );
  };

  const removeCard = (cardId: string) => {
    setSelectedCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleExport = () => {
    // Reload saved spreadsheet ID when opening modal
    const savedSpreadsheetId = localStorage.getItem("last_spreadsheet_id");
    if (savedSpreadsheetId) {
      setExistingSpreadsheetId(savedSpreadsheetId);
    }
    setShowExportDialog(true);
  };

  const handleExportConfirm = (useExisting: boolean) => {
    const spreadsheetIdToUse = useExisting ? existingSpreadsheetId : undefined;

    // Save spreadsheet ID to localStorage if provided
    if (spreadsheetIdToUse) {
      localStorage.setItem("last_spreadsheet_id", spreadsheetIdToUse);
    }

    exportMutation.mutate({
      cards: selectedCards,
      spreadsheetId: spreadsheetIdToUse,
    });
  };

  const isSelected = (cardId: string) =>
    selectedCards.some((c) => c.id === cardId);
  const totalCardsInCart = selectedCards.reduce(
    (sum, card) => sum + card.quantity,
    0,
  );

  const canGoPreviousPage = currentPage > 1;
  const canGoNextPage = currentPage < totalPages;
  let resultsLabel = "Searching...";

  if (!isLoading) {
    const suffix = totalResults === 1 ? "" : "s";
    resultsLabel = `${totalResults} result${suffix} found`;
  }

  const handlePreviousPage = () => {
    if (canGoPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleReconnectGoogle = async () => {
    try {
      setIsReconnecting(true);
      await openGoogleAuthPopup();
      toast("Reconnect started", {
        description:
          "Complete Google sign-in in the popup to refresh your session.",
      });
    } catch (error) {
      console.error("Failed to start Google reconnect:", error);
      toast("Reconnect failed", {
        description: "Could not open Google sign-in popup.",
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Card Search</h1>
          <p className="text-muted-foreground">
            Search and select cards to export to Google Sheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReconnectGoogle}
            variant="secondary"
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Reconnect Google
          </Button>
        </div>
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
      <Card
        className={`sticky top-3 z-10 w-full mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-200 ${
          isScrolledDown ? "p-3 max-w-3xl" : "p-4"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`${isScrolledDown ? "text-base" : "text-lg"} font-semibold`}
          >
            Selected Cards ({totalCardsInCart})
          </h2>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending || selectedCards.length === 0}
            size={isScrolledDown ? "default" : "sm"}
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Export to Google Sheets
          </Button>
        </div>

        <div className="relative mb-3">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${
              isScrolledDown ? "h-3.5 w-3.5" : "h-4 w-4"
            }`}
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards by name..."
            className={`pl-9 pr-9 ${isScrolledDown ? "h-9 text-sm" : "h-11 text-base"}`}
          />
          {isLoading && (
            <Loader2
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin ${
                isScrolledDown ? "h-3.5 w-3.5" : "h-4 w-4"
              }`}
            />
          )}
        </div>

        {selectedCards.length === 0 ? (
          <p
            className={`${isScrolledDown ? "text-xs" : "text-sm"} text-muted-foreground`}
          >
            Cart is empty. Click cards below to add them.
          </p>
        ) : (
          <div
            className={`space-y-2 overflow-y-auto ${
              isScrolledDown ? "max-h-48" : "max-h-96"
            }`}
          >
            {selectedCards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center rounded-lg bg-muted/50 ${
                  isScrolledDown ? "gap-2 p-1.5" : "gap-3 p-2"
                }`}
              >
                <img
                  src={card.data.images.small}
                  alt={card.data.name}
                  className={`${
                    isScrolledDown ? "w-8 h-10" : "w-12 h-16"
                  } object-contain rounded`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`${
                      isScrolledDown ? "text-xs" : "text-sm"
                    } font-medium truncate`}
                  >
                    {card.data.name}
                  </p>
                  <p
                    className={`${
                      isScrolledDown ? "text-[10px]" : "text-xs"
                    } text-muted-foreground`}
                  >
                    {card.data.set?.name}
                    {card.data.number && ` #${card.data.number}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className={isScrolledDown ? "h-6 w-6" : "h-8 w-8"}
                    onClick={() => updateQuantity(card.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span
                    className={`${
                      isScrolledDown ? "w-6 text-xs" : "w-8"
                    } text-center font-medium`}
                  >
                    {card.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className={isScrolledDown ? "h-6 w-6" : "h-8 w-8"}
                    onClick={() => updateQuantity(card.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={isScrolledDown ? "h-6 w-6" : "h-8 w-8"}
                    onClick={() => removeCard(card.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Results Count */}
      {debouncedQuery && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{resultsLabel}</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!canGoPreviousPage || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!canGoNextPage || isLoading}
              >
                Next
              </Button>
            </div>
          )}
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
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
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
                        className="w-full h-full object-cover"
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
                onChange={(e) =>
                  setExistingSpreadsheetId(e.target.value.trim())
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create a new spreadsheet. Or paste the ID from an
                existing sheet's URL.
              </p>
              {existingSpreadsheetId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setExistingSpreadsheetId("");
                    localStorage.removeItem("last_spreadsheet_id");
                  }}
                  className="text-xs"
                >
                  Clear saved ID
                </Button>
              )}
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
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Create New
            </Button>
            {existingSpreadsheetId && (
              <Button
                onClick={() => handleExportConfirm(true)}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
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
