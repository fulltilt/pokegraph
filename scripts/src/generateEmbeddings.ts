import { PrismaClient } from "@prisma/client";
import { pipeline } from "@xenova/transformers";

const prisma = new PrismaClient();

async function main() {
  console.log("Loading CLIP model...");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/clip-vit-base-patch32"
  );

  console.log("Fetching cards without embeddings...");
  const cards = await prisma.card.findMany({
    where: { embedding: null },
  });

  console.log(`Found ${cards.length} cards to process.`);

  for (const [i, card] of cards.entries()) {
    try {
      const imageUrl = card.data?.images?.large;
      if (!imageUrl) {
        console.warn(`Skipping card ${card.id} — no image URL`);
        continue;
      }

      // Compute embedding
      const output = await extractor(imageUrl, {
        pooling: "mean",
        normalize: true,
      });
      const embedding = Array.from(output.data);

      // Store embedding back in DB
      await prisma.$executeRawUnsafe(
        `UPDATE "Card" SET embedding = $1::vector WHERE id = $2`,
        `[${embedding.join(",")}]`,
        card.id
      );

      console.log(`✅ (${i + 1}/${cards.length}) Processed ${card.id}`);
    } catch (err) {
      console.error(`❌ Error processing ${card.id}:`, err);
    }
  }

  console.log("✅ Done embedding all cards!");
  await prisma.$disconnect();
}

main().catch(console.error);
