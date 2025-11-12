import { Router, Request, Response } from "express";
import {
  getTopMoversPerSetByPercentage,
  getTopMoverPerSetByPrice,
  getSetsBySeries,
  getTopMoversBySet,
} from "../services/setService";
import { getTimeframeInterval } from "../utils/dateUtils";

const router = Router();

router.get("/sets-by-series", async (req: Request, res: Response) => {
  const series = req.query.series as string;

  if (!series) {
    res.status(400).json({ error: "Missing series parameter" });
    return;
  }

  try {
    const sets = await getSetsBySeries(series);
    return sets;
  } catch (error) {
    console.error("Error fetching sets by series:", error);
    res.status(500).json({ error: "Error fetching sets by serie" });
  }
});

router.get("/top-mover-per-set/:order", async (req: Request, res: Response) => {
  const { order } = req.params;
  const timeframe = req.query.timeframe || "10d";

  const intervalMap: Record<string, string> = {
    "10d": "10 days",
    "1m": "1 month",
    "3m": "3 months",
    "6m": "6 months",
    "1y": "1 year",
  };

  const sqlInterval = intervalMap[timeframe as string] || "10 days";

  try {
    const results = await getTopMoversPerSetByPercentage(order, sqlInterval);
    res.json(results);
  } catch (err) {
    console.error("Error getting top movers:", err);
    res.status(500).json({ error: "Error getting top movers by percentage" });
  }
});

router.get(
  "/top-mover-per-set-price/:order",
  async (req: Request, res: Response) => {
    const { order } = req.params;
    const timeframe = req.query.timeframe || "10d";

    const intervalMap: Record<string, string> = {
      "10d": "10 days",
      "1m": "1 month",
      "3m": "3 months",
      "6m": "6 months",
      "1y": "1 year",
    };

    const sqlInterval = intervalMap[timeframe as string] || "10 days";

    try {
      const results = await getTopMoverPerSetByPrice(order, sqlInterval);
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch top movers by price." });
    }
  }
);

router.get(
  "/top-movers-by-set/:setName/:order",
  async (req: Request, res: Response) => {
    const { setName, order } = req.params;
    const rawTimeframe = req.query.timeframe;
    const interval = getTimeframeInterval(rawTimeframe);

    try {
      const topGainers = await getTopMoversBySet(setName, order, interval);
      return topGainers;
    } catch (error) {
      console.error("Error fetching top movers by set:", error);
      res.status(500).send("Error fetching top movers by set");
    }
  }
);

export default router;
