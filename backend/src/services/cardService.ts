import { DatabaseCardMatch, RawCardRecord } from "../types";
import { prisma } from "@pokemon/shared";

export async function getCardsFromSet(
  set: string,
  skip: number,
  take: number
): Promise<any[]> {
  try {
    const cards = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT *
      FROM "Card"
      WHERE data->'set'->>'name' = $1
      ORDER BY
        CASE
          WHEN data->>'number' ~ '^[0-9]+$' THEN (data->>'number')::int
          ELSE NULL
        END NULLS LAST,
        CASE
          WHEN data->>'number' ~ '^[0-9]+$' THEN NULL
          ELSE SUBSTRING(data->>'number', '^[0-9]+')::int
        END NULLS LAST,
        data->>'number'
      OFFSET ${skip}
      LIMIT ${take}
      `,
      set
    );
    // ORDER BY (data->>'number')::int

    return cards;
  } catch (error) {
    console.error("Database query error in getCards:", error);
    return [];
  }
}

/**
 * Finds similar cards based on a provided embedding vector using pgvector's
 * cosine distance calculation.
 * @param embedding The image embedding vector to search against.
 * @param topK The maximum number of results to return.
 * @param threshold The minimum similarity score required (0 to 1).
 * @returns A promise that resolves to an array of matching cards.
 */
export async function findSimilarCards(
  embedding: number[],
  topK: number = 5,
  threshold: number = 0.75
): Promise<DatabaseCardMatch[]> {
  try {
    // Format embedding array for PostgreSQL's 'vector' type
    const embeddingStr = `[${embedding.join(",")}]`;

    // The query uses '<=>' (distance operator) and '1 - distance' for similarity
    const results = await prisma.$queryRaw<DatabaseCardMatch[]>`
      SELECT 
        id,
        data,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM "Card"
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
      ORDER BY embedding <=> ${embeddingStr}::vector -- Order by distance (ascending)
      LIMIT ${topK}
    `;

    return results;
  } catch (error) {
    console.error("Database query error in findSimilarCards:", error);
    return [];
  }
}

/**
 * Searches for cards using PostgreSQL's fuzzy text similarity function (SIMILARITY).
 * @param name The card name query string.
 * @param limit The maximum number of results to return.
 * @returns A promise that resolves to an array of matching cards.
 */
export async function searchCardsByName(name: string, limit: number = 10) {
  return await prisma.$queryRawUnsafe(
    `
    SELECT *
    FROM "Card"
    WHERE SIMILARITY(data->>'name', $1) > 0.3
    ORDER BY SIMILARITY(data->>'name', $1) DESC
    LIMIT $2
    `,
    name,
    limit
  );
}

/**
 * Retrieves a single card by its unique ID.
 * @param id The unique card ID.
 * @returns A promise that resolves to the Card object or null.
 */
export async function getCardById(id: string) {
  return await prisma.card.findUnique({
    where: { id },
  });
}

/**
 * Retrieves a paginated list of cards belonging to a specific set name,
 * ordered by the card's number (handling mixed numeric/text values).
 * @param setName The name of the Pokemon set.
 * @param skip The number of rows to skip (for pagination).
 * @param take The number of rows to take (page size).
 * @returns A promise that resolves to an array of card objects.
 */
export async function getCardsBySet(
  setName: string,
  skip: number,
  take: number
): Promise<RawCardRecord[]> {
  // Note: The skip/limit are injected directly into the query string for raw queries
  return await prisma.$queryRawUnsafe(
    `
    SELECT
      id,
      data -- Exclude the 'embedding' column here as Prisma client doesn't know how to translate PostgreSQL vector type into usable JS object
    FROM "Card"
    WHERE data->'set'->>'name' = $1
    ORDER BY 
      CASE 
        WHEN data->>'number' ~ '^[0-9]+$' THEN (data->>'number')::int
        ELSE NULL
      END NULLS LAST,
      CASE 
        WHEN data->>'number' ~ '^[0-9]+$' THEN NULL
        ELSE SUBSTRING(data->>'number', '^[0-9]+')::int
      END NULLS LAST,
      data->>'number'
    OFFSET ${skip}
    LIMIT ${take}
    `,
    setName
  );
}

/**
 * Retrieves the price and quantity history for a specific card ID after a given date.
 * @param cardId The ID of the card.
 * @param fromDate The starting date for the price history.
 * @returns A promise that resolves to an array of price history entries.
 */
export async function getCardPriceHistory(cardId: string, fromDate: Date) {
  return await prisma.$queryRawUnsafe(
    `
    SELECT 
      DATE("date") AS date,
      price,
      quantity
    FROM "PriceEntry"
    WHERE "cardId" = $1
      AND "date" >= $2
    ORDER BY DATE("date") ASC
    `,
    cardId,
    fromDate
  );
}
