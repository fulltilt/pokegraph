import { Router } from "express";
import type { Request, Response } from "express";
import {
  searchCardsByName,
  getCardsBySet,
  getCardById,
  getCardPriceHistory,
} from "../services/cardService";
import { convertTimeframeToDate } from "../utils/dateUtils";
import type { CardData, RawCardRecord } from "../types";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3457/api/cards/oauth2callback",
);

const router = Router();

type ExportCard = {
  tcgPlayerId?: string | number;
  quantity?: number;
  data: {
    name?: unknown;
    number?: unknown;
    setName?: unknown;
    set?: unknown;
    images?: {
      small?: string;
    };
  };
};

type ExportCardWithPrice = ExportCard & {
  price: number | null;
};

type TcgApiResponse = {
  result?: Array<{
    condition?: string;
    buckets?: Array<{
      marketPrice?: number;
    }>;
  }>;
};

router.get("/bySet", async (req: Request, res: Response) => {
  const { set, page = "1", pageSize = "20" } = req.query;

  const take = Number.parseInt(pageSize as string, 10);
  const skip = (Number.parseInt(page as string, 10) - 1) * take;

  if (!set || Number.isNaN(skip) || Number.isNaN(take)) {
    res.status(400).json({ message: "Invalid query params" });
    return;
  }

  /*
  This solution uses a multi-part sorting approach to handle your mixed numeric and alphanumeric values:

  First, it sorts pure numeric values (like 17, 18, 19, 20) by their integer value
  Next, it handles alphanumeric values (like '19a') by extracting and sorting by the numeric prefix
  Finally, it sorts by the full string value to handle any remaining ties

  This approach will give you the sorting you want: 17, 18, 19, 19a, 20.

  NOTE: the query doesn't work as intended but I'm okay with the result. If the card is '101a', that
  card will be appended at the end of the numeric-only cards
  */
  try {
    const cards = await getCardsBySet(set as string, skip, take);

    res.json(
      cards.map((card: RawCardRecord) => {
        const data = card.data as unknown as CardData;

        return {
          id: card.id,
          name: data.name,
          image: data.images?.small,
          set: data.set?.name,
        };
      }),
    );
  } catch (err) {
    console.error("Error getting cards by set", err);
    res.status(500).json({ message: "Failed to fetch cards" });
  }
});

// Search cards by name
router.get("/cards-search", async (req: Request, res: Response) => {
  const name = req.query.name as string;

  if (!name) {
    return res.status(400).json({ error: "Missing card name" });
  }

  try {
    const results = await searchCardsByName(name);
    res.json(results);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = Number.parseInt(req.query.limit as string, 10) || 20;

    if (!query || query.trim().length === 0) {
      return res.json({ cards: [] });
    }

    // Using pg_trgm similarity search
    const cards = await searchCardsByName(query, limit);
    res.json({ cards });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search cards" });
  }
});

// Get cards by set
router.get("/cards", async (req: Request, res: Response) => {
  const { set, page = "1", pageSize = "20" } = req.query;

  const take = Number.parseInt(pageSize as string, 10);
  const skip = (Number.parseInt(page as string, 10) - 1) * take;

  if (!set || Number.isNaN(skip) || Number.isNaN(take)) {
    return res.status(400).json({ message: "Invalid query params" });
  }

  try {
    const cards = await getCardsBySet(set as string, skip, take);

    res.json(
      cards.map((card: RawCardRecord) => {
        const data = card.data as CardData;
        return {
          id: card.id,
          name: data.name,
          image: data.images?.small,
          set: data.set?.name,
        };
      }),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cards" });
  }
});

// Get card by ID
router.get("/card/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const card = await getCardById(id);

  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }

  res.json(card);
});

// Get card price history
router.get("/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { timeframe = "1m" } = req.query;

  const fromDate = convertTimeframeToDate(timeframe as string);
  const history = await getCardPriceHistory(id, fromDate);

  res.json(history);
});

// if (!spreadsheetId) {
//       res.status(500).json({ error: "Failed to create spreadsheet" });
//       return;
//     }
// Get Google OAuth URL
router.get("/auth-url", (_req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
  console.log("Generated auth URL:", authUrl);
  console.log("Redirect URI in env:", process.env.GOOGLE_REDIRECT_URI);

  res.json({ authUrl });
});

// OAuth2 callback
router.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);

    // In production, store tokens securely (database, encrypted cookies, etc.)
    // For now, send back to frontend
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', tokens: ${JSON.stringify(
              tokens,
            )} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

// Price fetching function
async function fetchCardPrice(tcgPlayerId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://infinite-api.tcgplayer.com/price/history/${tcgPlayerId}/detailed?range=month`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      },
    );

    if (!res.ok) {
      console.error(
        `Failed to fetch price for ${tcgPlayerId}: ${res.statusText}`,
      );
      return null;
    }

    const json = (await res.json()) as TcgApiResponse;
    const nmResults = json.result?.find(
      (result) => result.condition === "Near Mint",
    );

    return nmResults?.buckets?.[0]?.marketPrice || null;
  } catch (error) {
    console.error(`Error fetching price for ${tcgPlayerId}:`, error);
    return null;
  }
}

// Batch fetch prices with retry logic
async function fetchPricesInBatches(cards: ExportCard[], batchSize = 5) {
  const cardsWithPrices: ExportCardWithPrice[] = [];

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);

    console.log(
      `Fetching prices for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        cards.length / batchSize,
      )}`,
    );

    const prices = await Promise.all(
      batch.map((card) =>
        card.tcgPlayerId
          ? fetchCardPrice(String(card.tcgPlayerId))
          : Promise.resolve(null),
      ),
    );

    batch.forEach((card, idx) => {
      cardsWithPrices.push({
        ...card,
        price: prices[idx],
      });
    });

    // Rate limit: wait 500ms between batches to avoid overwhelming the API
    if (i + batchSize < cards.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return cardsWithPrices;
}

type SpreadsheetContext = {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
};

const EXPORT_HEADERS = [
  "Card Name",
  "Image",
  "Card Number",
  "Set",
  "Quantity",
  "Price",
  "Total",
];

function normalizeCellValue(field: unknown): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object") {
    const namedField = field as { name?: unknown };
    return typeof namedField.name === "string"
      ? namedField.name
      : JSON.stringify(field);
  }
  if (typeof field === "number" || typeof field === "boolean") {
    return String(field);
  }
  return "";
}

function buildExportRows(
  cardsWithPrices: ExportCardWithPrice[],
  startRow: number,
) {
  return cardsWithPrices.map((card, index) => {
    const rowNumber = startRow + index;

    return [
      card.tcgPlayerId
        ? `=HYPERLINK("https://www.tcgplayer.com/product/${
            card.tcgPlayerId
          }", "${normalizeCellValue(card.data.name).replaceAll('"', '""')}")`
        : normalizeCellValue(card.data.name),
      card.data.images?.small ? `=IMAGE("${card.data.images.small}")` : "",
      normalizeCellValue(card.data.number),
      normalizeCellValue(card.data.setName || card.data.set),
      card.quantity || 1,
      card.price || "",
      `=E${rowNumber}*F${rowNumber}`,
    ];
  });
}

function buildFormatRequests(
  sheetId: number,
  startRow: number,
  rowCount: number,
) {
  const requests: Array<Record<string, unknown>> = [
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: startRow - 1,
          endIndex: startRow + rowCount,
        },
        properties: {
          pixelSize: 100,
        },
        fields: "pixelSize",
      },
    },
  ];

  if (startRow === 2) {
    requests.push(
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                bold: true,
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: "gridProperties.frozenRowCount",
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: "COLUMNS",
            startIndex: 1,
            endIndex: 2,
          },
          properties: {
            pixelSize: 100,
          },
          fields: "pixelSize",
        },
      },
    );
  }

  return requests;
}

async function refreshAccessTokenIfNeeded(accessToken: string) {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (credentials.access_token && credentials.access_token !== accessToken) {
      oauth2Client.setCredentials(credentials);
      return credentials.access_token;
    }
  } catch {
    console.log("Token refresh failed, trying with existing token");
  }

  return null;
}

async function getSpreadsheetContext(
  sheets: ReturnType<typeof google.sheets>,
  existingSpreadsheetId?: string,
): Promise<SpreadsheetContext> {
  if (existingSpreadsheetId) {
    const spreadsheetId = existingSpreadsheetId.trim();
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;

    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Cards!A:A",
    });

    const startRow =
      existingData.data.values && existingData.data.values.length > 0
        ? existingData.data.values.length + 2
        : 2;

    return { spreadsheetId, sheetId, startRow };
  }

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `Card Export - ${new Date().toISOString().split("T")[0]}`,
      },
      sheets: [
        {
          properties: {
            title: "Cards",
          },
        },
      ],
    },
  });

  if (!spreadsheet.data.spreadsheetId) {
    throw new Error("Failed to create spreadsheet");
  }

  return {
    spreadsheetId: spreadsheet.data.spreadsheetId,
    sheetId: spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0,
    startRow: 2,
  };
}

// NOSONAR: This endpoint coordinates auth, external API calls, and sheet formatting in one transactional flow.
router.post("/export", async (req: Request, res: Response) => {
  try {
    const {
      cards,
      accessToken,
      refreshToken,
      spreadsheetId: existingSpreadsheetId,
    } = req.body as {
      cards?: ExportCard[];
      accessToken?: string;
      refreshToken?: string;
      spreadsheetId?: string;
    };

    if (!cards || cards.length === 0) {
      return res.status(400).json({ error: "No cards to export" });
    }

    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" });
    }

    console.log(`Starting export for ${cards.length} cards...`);

    // Fetch prices for all cards
    console.log("Fetching prices from TCGPlayer...");
    const cardsWithPrices = await fetchPricesInBatches(cards);
    console.log("Price fetching complete");

    // Set credentials with user's tokens
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const newAccessToken = await refreshAccessTokenIfNeeded(accessToken);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    let spreadsheetContext: SpreadsheetContext;
    try {
      spreadsheetContext = await getSpreadsheetContext(
        sheets,
        existingSpreadsheetId,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({
        error: `Could not access spreadsheet. Make sure the ID is correct and you have permission to edit it. Error: ${message}`,
      });
    }

    const { spreadsheetId, sheetId, startRow } = spreadsheetContext;
    const rows = buildExportRows(cardsWithPrices, startRow);

    // Only write headers if it's a new sheet or starting at row 2
    const dataToWrite = startRow === 2 ? [EXPORT_HEADERS, ...rows] : rows;
    const rangeStart = startRow === 2 ? "A1" : `A${startRow}`;

    // Write data to the sheet (append mode)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Cards!${rangeStart}`,
      valueInputOption: "USER_ENTERED", // Changed to USER_ENTERED to process formulas
      requestBody: {
        values: dataToWrite,
      },
    });

    const formatRequests = buildFormatRequests(sheetId, startRow, rows.length);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: formatRequests,
      },
    });

    res.json({
      message: "Export successful",
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      lastRow: startRow + rows.length - 1, // Last row with data for scrolling
      newAccessToken, // Send back new token if refreshed
    });
  } catch (error: unknown) {
    console.error("Export error:", error);

    // Check if it's an auth error
    const message = error instanceof Error ? error.message : "";
    if (message.includes("authentication") || message.includes("credentials")) {
      return res.status(401).json({
        error: "Invalid or expired authentication token. Please sign in again.",
      });
    }

    res.status(500).json({ error: "Failed to export to Google Sheets" });
  }
});

export default router;
