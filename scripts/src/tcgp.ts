/** Get TCGPlayer card ids **/
// const links = Array.from(document.querySelectorAll('a[href^="/product/"]'));
// const xValues = links
//   .map((link) => {
//     const match = link?.getAttribute("href")?.match(/^\/product\/([^/]+)\//);
//     return match ? match[1] : null;
//   })
//   .filter(Boolean) // Remove nulls
//   .filter((_, i) => i % 2 === 0);
// console.log(xValues);
/**  **/

// https://infinite-api.tcgplayer.com/price/history/{id}/detailed?range=[month|quarter|semi-annual|annual]

import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { sets } from "./data/sets";

type CardData = {
  skuId: string;
  variant: string;
  language: string;
  condition: string;
  averageDailyQuantitySold: string;
  averageDailyTransactionCount: string;
  totalQuantitySold: string;
  totalTransactionCount: string;
  trendingMarketPricePercentages: Record<string, unknown>;
  buckets: Bucket[];
};

type Bucket = {
  marketPrice: string;
  quantitySold: string;
  lowSalePrice: string;
  lowSalePriceWithShipping: string;
  highSalePrice: string;
  highSalePriceWithShipping: string;
  transactionCount: string;
  bucketStartDate: string;
};

async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function fetchPage(id: string) {
  const res = await fetch(
    `https://infinite-api.tcgplayer.com/price/history/${id}/detailed?range=month`,
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
    throw new Error(`Failed to fetch card ${id}: ${res.statusText}`);
  }

  const json = await res.json();
  const nmResults = json.result.filter(
    (result: CardData) => result.condition === "Near Mint"
  )[0];

  return nmResults.buckets;
}

async function updateCard(buckets: Bucket[], cardId: string) {
  for (const bucket of buckets) {
    const date = new Date(bucket.bucketStartDate);
    date.setUTCHours(0, 0, 0, 0); // Ensures time is exactly midnight UTC

    try {
      await prisma.priceEntry.upsert({
        where: {
          cardId_date: {
            cardId: cardId,
            date,
          },
        },
        update: {
          price: parseFloat(bucket.marketPrice),
          quantity: parseInt(bucket.quantitySold),
        },
        create: {
          cardId: cardId,
          price: parseFloat(bucket.marketPrice),
          quantity: parseInt(bucket.quantitySold),
          date,
        },
      });
    } catch (error) {
      console.error(`Error inserting cardId ${cardId}:`, error);
    }
  }
  console.log(`Updated ${cardId}`);
}

const normalizeCardNumber = (set: string, idx: number) => {
  if (set === "smp") {
    if (idx < 10) return `SM0${idx}`;
    return `SM${idx}`;
  } else if (set === "sma") {
    return `SV${idx}`;
  } else if (set === "swshp") {
    if (idx < 10) return `SWSH00${idx}`;
    else if (idx < 100) return `SWSH0${idx}`;
    return `SWSH${idx}`;
  } else if (set === "swsh45sv") {
    if (idx < 10) return `SV00${idx}`;
    else if (idx < 100) return `SV0${idx}`;
    return `SV${idx}`;
  } else if (["swsh9tg", "swsh10tg", "swsh11tg", "swsh12tg"].includes(set)) {
    if (idx < 10) return `TG0${idx}`;
    return `TG${idx}`;
  } else if (set === "swsh12pt5gg") {
    if (idx < 10) return `GG0${idx}`;
    return `GG${idx}`;
  } else if (set === "hsp") {
    if (idx < 10) return `HGSS0${idx}`;
    return `HGSS${idx}`;
  } else if (set === "xyp") {
    if (idx < 10) return `XY0${idx}`;
    return `XY${idx}`;
  } else if (set === "bw11") {
    return `RC${idx}`;
  } else if (set === "bwp") {
    if (idx === 4 || idx === 5) return `BW00${idx}`;
    else if (idx < 10) return `BW0${idx}`;
    return `BW${idx}`;
  } else if (set === "dpp") {
    if (idx < 10) return `DP0${idx}`;
    return `DP${idx}`;
  }

  return idx;
};

async function main() {
  const CALL_LIMIT = 60; // how many calls before sleeping
  const SLEEP_MS = 4 * 60 * 1000; // 4 minutes

  let callCount = 0;

  for (const set of Object.keys(sets)) {
    const typedKey = set as keyof typeof sets; // key will always be a valid key of ids
    const { startIdx, ids } = sets[typedKey];

    console.log(`Initiating processing set ${set}...`);
    for (let idx = 0; idx < ids.length; idx++) {
      const tcgPlayerId = ids[idx];
      try {
        const buckets = await fetchPage(tcgPlayerId);
        const cardId = `${set}-${normalizeCardNumber(set, startIdx + idx)}`;
        await updateCard(buckets, cardId);

        // await prisma.card.update({
        //   where: {
        //     id: cardId, // string
        //   },
        //   data: {
        //     tcgPlayerId, // string | null
        //   },
        // });

        ++callCount;
        // If we've hit the limit, sleep and reset
        if (callCount % CALL_LIMIT === 0) {
          console.log(`⏸️ Hit ${CALL_LIMIT} calls. Sleeping for 5 minutes...`);
          await sleep(SLEEP_MS);
          console.log("✅ Resuming...");
        }
      } catch (err) {
        console.error(`Failed on card ${tcgPlayerId}:`, err);
      }
    }

    console.log(`Finished processing set ${set}.`);
  }

  console.log("All sets processed.");
}

main();
