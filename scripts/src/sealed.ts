import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import { sealedProductNames } from "@pokemon/shared/src/constants";
interface SoldItem {
  title: string;
  price: number;
  url: string;
  soldAt?: Date;
}

const prisma = new PrismaClient();

// --------------------------------------------
// Preprocessing function (unchanged except comments)
// --------------------------------------------
export function preprocessListing(title: string, price: number): string {
  const originalTitle = title.trim();
  const t = originalTitle.toLowerCase();

  // Detect quantity
  let quantity = 1;
  const qtyPatterns = [
    /qty\s*(\d+)/i,
    /x\s*(\d+)/i,
    /(\d+)\s*x/i,
    /(\d+)\s*pack/i,
    /lot\s*of\s*(\d+)/i,
    /(\d+)\s*lot/i,
    /(\d+)\s*boxes/i,
    /(\d+)\s*box/i,
  ];

  for (const pattern of qtyPatterns) {
    const match = t.match(pattern);
    if (match?.[1]) quantity = Math.max(quantity, parseInt(match[1], 10));
  }

  // Bundle detection
  const isBundle = /\b(lot|bundle|set of|includes|plus|&|with)\b/i.test(
    originalTitle
  );

  // Language detection
  let lang = "EN";
  if (/\bjapanese\b|\bjpn\b|\bjp\b/i.test(t)) lang = "JP";
  if (/\bkorean\b|\bkor\b/i.test(t)) lang = "KR";

  // Keywords
  const keywords = [];
  if (t.includes("booster box")) keywords.push("BOOSTER_BOX");
  if (t.includes("booster pack")) keywords.push("BOOSTER_PACK");
  if (t.includes("case")) keywords.push("CASE");
  if (t.includes("sealed")) keywords.push("SEALED");
  if (t.includes("factory sealed")) keywords.push("FACTORY_SEALED");

  // Tokens
  const tokens: string[] = [];
  tokens.push(`[PRICE_${price.toFixed(2)}]`);
  tokens.push(`[QTY_${quantity}]`);
  if (quantity > 1) tokens.push("[MULTI_QTY]");
  if (isBundle) tokens.push("[BUNDLE]");
  tokens.push(`[LANG_${lang}]`);
  for (const kw of keywords) tokens.push(`[KW_${kw}]`);

  tokens.push("[TITLE]");
  tokens.push(originalTitle);

  return tokens.join(" ");
}

// --------------------------------------------
// Bundle filter
// --------------------------------------------
const EXCLUDE_KEYWORDS = [
  "bundle",
  "lot",
  "with extras",
  "includes",
  "plus",
  "and",
  "bonus",
  "extra",
  "combo",
  "promo",
];

function isListingClean(title: string): boolean {
  const lower = title.toLowerCase();
  return !EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw));
}

// --------------------------------------------
// Fetch eBay solds
// --------------------------------------------
async function getLastSolds(
  query: string,
  product: string
): Promise<SoldItem[]> {
  const formatted = query.replace(/\s+/g, "+");
  const url = `https://www.ebay.com/sch/i.html?_nkw=${formatted}&LH_Sold=1&LH_Complete=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      Referer: "https://www.ebay.com/",
    },
  });

  if (!res.ok)
    throw new Error(`Failed to fetch results for ${product}: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const items: SoldItem[] = [];

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  $("ul.srp-results li[data-listingid]").each((_, li) => {
    const title = $(li)
      .find(".s-card__title .su-styled-text.primary")
      .text()
      .trim();
    const priceText = $(li).find(".s-card__price").text().trim();

    const deliveryText = $(li)
      .find(".s-card__attribute-row .su-styled-text.secondary.large")
      .filter((i, el) => $(el).text().includes("delivery"))
      .text()
      .trim();

    const soldAt = new Date($(li).find(".s-card__caption span").text().trim());
    if (isNaN(soldAt.getTime()) || soldAt < cutoff) return;

    const url = $(li).find("a.s-card__link.image-treatment").attr("href") || "";
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
    const delivery = parseFloat(deliveryText.replace(/[^0-9.]/g, "")) || 0;

    if (!title || !priceText || !url) return;
    if (!isListingClean(title)) return;

    items.push({
      title,
      price: price + delivery,
      url,
      soldAt,
    });
  });

  return items;
}

// --------------------------------------------
// Save listings to DB (now includes preprocessed)
// --------------------------------------------
async function saveItems(product: string) {
  const query = `${product} -japanese -korean -half -case -codes -psa -bulk -empty -collection -lot -digital`;

  const items = await getLastSolds(query, product);
  console.log(`Processing ${product}: ${items.length} listings found`);

  const sealed = await prisma.sealed.upsert({
    where: { product },
    update: {},
    create: { product },
  });

  for (const item of items) {
    try {
      const preprocessed = preprocessListing(item.title, item.price);

      await prisma.sealedPriceEntry.create({
        data: {
          price: item.price,
          soldAt: item.soldAt!,
          sealedId: sealed.id,
          title: item.title,
          url: item.url,
          preprocessed, // <-- NEW FIELD WRITTEN HERE
        },
      });

      console.log(
        `Saved: ${item.title} @ $${
          item.price
        } on ${item.soldAt?.toDateString()}`
      );
    } catch (err) {
      console.log(`Error saving: ${item.title}: ${err}`);
    }
  }
}

// --------------------------------------------
// Correct sleep and sequential looping
// --------------------------------------------
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function run() {
  let count = 0;

  for (const product of sealedProductNames) {
    await saveItems(product);
    console.log(`✓ Finished ${product}`);

    count++;

    // sleep every 40 requests
    if (count % 40 === 0) {
      console.log("Sleeping 1 second...");
      await sleep(1000);
    }
  }
}

run().catch(console.error);
