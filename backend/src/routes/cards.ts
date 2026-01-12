import { Router, Request, Response } from "express";
import {
  searchCardsByName,
  getCardsBySet,
  getCardById,
  getCardPriceHistory,
} from "../services/cardService";
import { convertTimeframeToDate } from "../utils/dateUtils";
import { CardData } from "../types";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3457/api/cards/oauth2callback"
);

const router = Router();

router.get("/bySet", async (req: Request, res: Response) => {
  const { set, q = "", filter = "", page = "1", pageSize = "20" } = req.query;

  const take = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * take;

  if (!set || isNaN(skip) || isNaN(take)) {
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
      cards.map((card: any) => {
        const data = card.data as unknown as CardData;

        return {
          id: card.id,
          name: data.name,
          image: data.images?.small,
          set: data.set?.name,
        };
      })
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
    const limit = parseInt(req.query.limit as string) || 20;

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

  const take = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * take;

  if (!set || isNaN(skip) || isNaN(take)) {
    return res.status(400).json({ message: "Invalid query params" });
  }

  try {
    const cards = await getCardsBySet(set as string, skip, take);

    res.json(
      (cards as any[]).map((card: any) => {
        const data = card.data as CardData;
        return {
          id: card.id,
          name: data.name,
          image: data.images?.small,
          set: data.set?.name,
        };
      })
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
router.get("/auth-url", (req, res) => {
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
              tokens
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
      }
    );

    if (!res.ok) {
      console.error(
        `Failed to fetch price for ${tcgPlayerId}: ${res.statusText}`
      );
      return null;
    }

    const json = await res.json();
    const nmResults = json.result.filter(
      (result: any) => result.condition === "Near Mint"
    )[0];

    return nmResults?.buckets?.[0]?.marketPrice || null;
  } catch (error) {
    console.error(`Error fetching price for ${tcgPlayerId}:`, error);
    return null;
  }
}

// Batch fetch prices with retry logic
async function fetchPricesInBatches(cards: any[], batchSize = 5) {
  const cardsWithPrices: any[] = [];

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);

    console.log(
      `Fetching prices for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        cards.length / batchSize
      )}`
    );

    const prices = await Promise.all(
      batch.map((card) =>
        card.tcgPlayerId
          ? fetchCardPrice(card.tcgPlayerId)
          : Promise.resolve(null)
      )
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

router.post("/export", async (req, res) => {
  try {
    const {
      cards,
      accessToken,
      refreshToken,
      spreadsheetId: existingSpreadsheetId,
    } = req.body;

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

    // Refresh token if needed
    let newAccessToken = null;
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      if (
        credentials.access_token &&
        credentials.access_token !== accessToken
      ) {
        newAccessToken = credentials.access_token;
        oauth2Client.setCredentials(credentials);
      }
    } catch (error) {
      // If refresh fails, try with existing token
      console.log("Token refresh failed, trying with existing token");
    }

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    let spreadsheetId: string;
    let sheetId: number;
    let startRow = 2; // Default: start at row 2 (after header)

    // Either use existing spreadsheet or create new one
    if (existingSpreadsheetId) {
      console.log("Using existing spreadsheet:", existingSpreadsheetId);
      spreadsheetId = existingSpreadsheetId.trim();

      try {
        // Get the spreadsheet info
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;

        // Find the last row with data to append after it
        const existingData = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Cards!A:A", // Get all data in column A
        });

        if (existingData.data.values && existingData.data.values.length > 0) {
          // Last row + 1 blank row + start of new data
          startRow = existingData.data.values.length + 2;
          console.log("Appending data starting at row:", startRow);
        }
      } catch (error: any) {
        console.error("Error accessing existing spreadsheet:", error.message);
        return res.status(400).json({
          error: `Could not access spreadsheet. Make sure the ID is correct and you have permission to edit it. Error: ${error.message}`,
        });
      }
    } else {
      console.log("Creating spreadsheet...");

      // Create a new spreadsheet
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

      console.log("Spreadsheet created:", spreadsheet.data.spreadsheetId);
      spreadsheetId = spreadsheet.data.spreadsheetId!;
      sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;
    }

    console.log("Sheet ID:", sheetId);

    // Prepare the data with formulas
    const headers = [
      "Card Name",
      "Image",
      "Card Number",
      "Set",
      "Quantity",
      "Price",
      "Total",
    ];
    const rows = cardsWithPrices.map((card: any, index: number) => {
      const getName = (field: any) => {
        if (!field) return "";
        if (typeof field === "string") return field;
        if (typeof field === "object")
          return field.name || JSON.stringify(field);
        return String(field);
      };

      const rowNumber = startRow + index; // Use startRow instead of index + 2

      return [
        // Card name with hyperlink
        card.tcgPlayerId
          ? `=HYPERLINK("https://www.tcgplayer.com/product/${
              card.tcgPlayerId
            }", "${getName(card.data.name).replace(/"/g, '""')}")`
          : getName(card.data.name),
        // Image formula
        card.data.images?.small ? `=IMAGE("${card.data.images.small}")` : "",
        getName(card.data.number),
        getName(card.data.setName || card.data.set),
        card.quantity || 1,
        card.price || "", // Use fetched price or empty string
        `=E${rowNumber}*F${rowNumber}`, // Total = Quantity * Price
      ];
    });

    // Only write headers if it's a new sheet or starting at row 2
    const dataToWrite = startRow === 2 ? [headers, ...rows] : rows;
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

    // Format the header row and set column widths (only if new sheet or first time)
    const formatRequests: any[] = [];

    // Always format new rows for images
    formatRequests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetId,
          dimension: "ROWS",
          startIndex: startRow - 1, // -1 because API uses 0-based indexing
          endIndex: startRow + rows.length,
        },
        properties: {
          pixelSize: 100,
        },
        fields: "pixelSize",
      },
    });

    // Only format header and columns if it's a new sheet
    if (startRow === 2) {
      formatRequests.push(
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
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
              sheetId: sheetId,
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
              sheetId: sheetId,
              dimension: "COLUMNS",
              startIndex: 1,
              endIndex: 2,
            },
            properties: {
              pixelSize: 100,
            },
            fields: "pixelSize",
          },
        }
      );
    }

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
  } catch (error: any) {
    console.error("Export error:", error);

    // Check if it's an auth error
    if (
      error.message?.includes("authentication") ||
      error.message?.includes("credentials")
    ) {
      return res.status(401).json({
        error: "Invalid or expired authentication token. Please sign in again.",
      });
    }

    res.status(500).json({ error: "Failed to export to Google Sheets" });
  }
});

export default router;
