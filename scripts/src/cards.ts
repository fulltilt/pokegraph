import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

const API_URL = "https://api.pokemontcg.io/v2/cards";
const TOTAL_PAGES = 90;

interface PokemonCard {
  id: string;
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      reverseHolofoil?: { market?: number };
      normal?: { market?: number };
    };
  };
  [key: string]: any; // catch-all for all other fields (e.g., set, name, etc.)
}

async function fetchPage(page: number) {
  const res = await fetch(`${API_URL}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

async function insertCards(cards: any[]) {
  for (const card of cards) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0); // Ensures time is exactly midnight UTC

    const marketPrice =
      card.tcgplayer?.prices?.holofoil?.market ??
      card.tcgplayer?.prices?.normal?.market ??
      card.tcgplayer?.prices?.reverseHolofoil?.market;

    try {
      await prisma.card.upsert({
        where: { id: card.id },
        update: { data: card },
        create: {
          id: card.id,
          data: card,
        },
      });

      if (marketPrice !== undefined) {
        await prisma.priceEntry.upsert({
          where: {
            cardId_date: {
              cardId: card.id,
              date,
            },
          },
          update: {},
          create: {
            cardId: card.id,
            price: marketPrice,
          },
        });
      }

      //   console.log(`Inserted ${card.id}`);
    } catch (error) {
      console.error(`Error inserting card ${card.id}:`, error);
    }
  }
}

async function main() {
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Fetching page ${page}...`);
    try {
      const cards = await fetchPage(page);
      await insertCards(cards);
    } catch (err) {
      console.error(`Failed on page ${page}:`, err);
    }
  }
}

main();
