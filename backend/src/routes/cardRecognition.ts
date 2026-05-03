import { Router } from "express";
import type { Request, Response } from "express";
import { uploadMiddleware } from "../middleware/upload";
import {
  getSingleEmbedding,
  detectAndEmbed,
  checkHealth,
} from "../services/embeddingService";
import { findSimilarCards } from "../services/cardService";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Single card recognition
router.post(
  "/recognize-card",
  uploadMiddleware.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const topK = Number.parseInt(req.query.topK as string, 10) || 5;
      const threshold =
        Number.parseFloat(req.query.threshold as string) || 0.75;

      console.log("📤 Generating embedding for single card...");
      const embedding = await getSingleEmbedding(req.file);
      console.log(`✅ Received embedding of length ${embedding.length}`);

      console.log("🔍 Searching for similar cards...");
      const matches = await findSimilarCards(embedding, topK, threshold);
      console.log(`✅ Found ${matches.length} matching cards`);

      res.json({
        success: true,
        matches: matches.map((match) => ({
          id: match.id,
          similarity: Number.parseFloat(match.similarity.toFixed(4)),
          name: match.data.name,
          setName: match.data.set?.name,
          setId: match.data.set?.id,
          number: match.data.number,
          rarity: match.data.rarity,
          images: match.data.images,
          prices: match.data.tcgplayer?.prices,
        })),
      });
    } catch (error) {
      console.error("❌ Error processing image:", error);
      res.status(500).json({
        error: "Failed to process image",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Multiple card recognition
router.post(
  "/recognize-cards",
  uploadMiddleware.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const topK = Number.parseInt(req.query.topK as string, 10) || 5;
      const threshold =
        Number.parseFloat(req.query.threshold as string) || 0.75;

      console.log("📤 Detecting and embedding cards...");
      const responseData = await detectAndEmbed(req.file);
      console.log(`✅ Detected ${responseData.cards_detected} card(s)`);

      const results = [];
      for (const card of responseData.cards) {
        console.log(
          `🔍 Searching for card ${card.card_index + 1}/${
            responseData.cards_detected
          }...`,
        );

        const matches = await findSimilarCards(card.embedding, topK, threshold);

        results.push({
          cardIndex: card.card_index,
          detectedCardNumber: card.card_index + 1,
          cardSize: card.card_size,
          boundingBox: card.bounding_box,
          matchesFound: matches.length,
          topMatch:
            matches.length > 0
              ? {
                  name: matches[0].data.name,
                  similarity: Number.parseFloat(
                    matches[0].similarity.toFixed(4),
                  ),
                  setName: matches[0].data.set?.name,
                }
              : null,
          matches: matches.map((match) => ({
            id: match.id,
            similarity: Number.parseFloat(match.similarity.toFixed(4)),
            name: match.data.name,
            setName: match.data.set?.name,
            setId: match.data.set?.id,
            number: match.data.number,
            rarity: match.data.rarity,
            images: match.data.images,
            prices: match.data.tcgplayer?.prices,
          })),
        });
      }

      console.log(`✅ Processed all ${responseData.cards_detected} card(s)`);

      res.json({
        success: true,
        cardsDetected: responseData.cards_detected,
        imageSize: responseData.image_size,
        results,
        summary: results.map((r) => ({
          cardNumber: r.detectedCardNumber,
          bestMatch: r.topMatch?.name || "No match",
          confidence: r.topMatch?.similarity
            ? `${(r.topMatch.similarity * 100).toFixed(1)}%`
            : "N/A",
          boundingBox: r.boundingBox,
        })),
      });
    } catch (error) {
      console.error("❌ Error processing image:", error);
      res.status(500).json({
        error: "Failed to process image",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Health check
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const embeddingServiceHealthy = await checkHealth();
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      embeddingService: embeddingServiceHealthy ? "connected" : "disconnected",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
