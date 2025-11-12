import { Router, Request, Response } from "express";
import {
  searchCardsByName,
  getCardsBySet,
  getCardById,
  getCardPriceHistory,
} from "../services/cardService";
import { convertTimeframeToDate } from "../utils/dateUtils";
import { CardData } from "../types";

const router = Router();

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
router.get("/cards/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const card = await getCardById(id);

  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }

  res.json(card);
});

// Get card price history
router.get("/card/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { timeframe = "1m" } = req.query;

  const fromDate = convertTimeframeToDate(timeframe as string);
  const history = await getCardPriceHistory(id, fromDate);

  res.json(history);
});

export default router;
