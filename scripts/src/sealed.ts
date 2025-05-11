// run script every day at 8am
// 0 8 * * * /usr/bin/node /path/to/your/ebayFetcher.js >> /tmp/ebay.log 2>&1

import { PrismaClient } from "../generated/prisma";
import * as cheerio from "cheerio";

interface SoldItem {
  title: string;
  price: number;
  url: string;
  soldAt?: Date;
}

const prisma = new PrismaClient();

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

// try to filter out listings that are bundles with 1 or more items
function isListingClean(title: string): boolean {
  const lower = title.toLowerCase();
  return !EXCLUDE_KEYWORDS.some((kw) => lower.includes(kw));
}

async function getLastSolds(query: string): Promise<SoldItem[]> {
  const formatted = query.replace(/\s+/g, "+");
  const url = `https://www.ebay.com/sch/i.html?_nkw=${formatted}&LH_Sold=1&LH_Complete=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch eBay results: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const items: SoldItem[] = [];

  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  $(".s-item").each((_, el) => {
    const title = $(el).find(".s-item__title").text().trim();
    const url = $(el).find(".s-item__link").attr("href") || "";
    const priceText = $(el).find(".s-item__price").first().text();

    if (
      title === "Shop on eBay" ||
      !title ||
      !priceText ||
      !url ||
      !priceText ||
      !isListingClean(title)
    )
      return;

    const cleanedPrice = priceText.replace(/[^\d.]/g, "");
    const price = parseFloat(cleanedPrice);

    const soldDateText = $(el)
      .find(".s-item__caption--signal.POSITIVE")
      .text()
      .trim();

    const dateString = soldDateText.replace(/^Sold\s+/, "").trim();
    const soldAt = new Date(dateString);

    // make sure date is valid and if so that it's within the last 24 hours
    if (isNaN(soldAt.getTime()) || soldAt < cutoff) return;

    if (title && !isNaN(price)) {
      items.push({
        title,
        price,
        url,
        soldAt,
      });
    }
  });

  return items;
}

async function saveItems(product: string) {
  const query = `${product} -japanese -korean -half -case`;
  const items = await getLastSolds(query);

  for (const item of items) {
    try {
      const sealed = await prisma.sealed.upsert({
        where: { product },
        update: {},
        create: {
          product,
        },
      });

      await prisma.sealedPriceEntry.create({
        data: {
          price: item.price,
          soldAt: item.soldAt!,
          sealedId: sealed.id,
          title: item.title,
          url: item.url,
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

const items = [
  "Sword and Shield Base Booster Box",
  "Sword and Shield base Elite Trainer Box set",
  "Rebel Clash Booster Box",
  "Rebel Clash Elite Trainer Box",
  "Darkness Ablaze Booster Box",
  "Darkness Ablaze Elite Trainer Box",
  "Champions Path Elite Trainer Box",
  "Vivid Voltage Booster Box",
  "Vivid Voltage Elite Trainer Box",
  "Shining Fates Elite Trainer Box",
  "Battle Styles Booster Box",
  "Battle Styles Elite Trainer Box Set",
  "Chilling Reign Booster Box",
  "Chilling Reign Elite Trainer Box Set -center",
  "Chilling Reign Pokemon Center Elite Trainer Box Set",
  "Evolving Skies Booster Box",
  "Evolving Skies Elite Trainer Box Set -center",
  "Evolving Skies Pokemon Center Elite Trainer Box Set",
  "Fusion Strike Booster Box",
  "Fusion Strike Elite Trainer Box -center",
  "Fusion Strike Pokemon Center Elite Trainer Box",
  "Celebrations Elite Trainer Box -center",
  "Celebrations Pokemon Center Elite Trainer Box",
  "Brilliant Stars Booster Box",
  "Brilliant Stars Elite Trainer Box -center",
  "Brilliant Stars Pokemon Center Elite Trainer Box",
  "Astral Radiance Booster Box",
  "Astral Radiance Elite Trainer Box -center",
  "Astral Radiance Pokemon Center Elite Trainer Box",
  "Pokemon Go Elite Trainer Box -center",
  "Pokemon Go Pokemon Center Elite Trainer Box",
  "Lost Origin Booster Box",
  "Lost Origin Elite Trainer Box -center",
  "Lost Origin Pokemon Center Elite Trainer Box",
  "Silver Tempest Booster Box",
  "Silver Tempest Elite Trainer Box -center",
  "Silver Tempest Pokemon Center Elite Trainer Box",
  "Crown Zenith Elite Trainer Box -center",
  "Crown Zenith Pokemon Center Elite Trainer Box",
  "Scarlet Violet Base Booster Box",
  "Scarlet Violet Base Elite Trainer Box Set -center",
  "Scarlet Violet Base Pokemon Center Elite Trainer Box Set",
  "Paldea Evolved Booster Box",
  "Paldea Evolved Elite Trainer Box -center",
  "Paldea Evolved Pokemon Center Elite Trainer Box",
  "Obsidian Flames Booster Box",
  "Obsidian Flames Elite Trainer Box -center",
  "Obsidian Flames Pokemon Center Elite Trainer Box",
  "151 Elite Trainer Box -center",
  "151 Pokemon Center Elite Trainer Box",
  "Paradox Rift Booster Box",
  "Paradox Rift Elite Trainer Box -center",
  "Paradox Rift Pokemon Center Elite Trainer Box",
  "Paldean Fates Elite Trainer Box -center",
  "Paldean Fates Pokemon Center Elite Trainer Box",
  "Temporal Forces Booster Box",
  "Temporal Forces Elite Trainer Box Set -center",
  "Temporal Forces Pokemon Center Elite Trainer Box Set",
  "Twilight Masquerade Booster Box",
  "Twilight Masquerade Elite Trainer Box -center",
  "Twilight Masquerade Pokemon Center Elite Trainer Box",
  "Shrouded Fable Elite Trainer Box -center",
  "Shrouded Fable Pokemon Center Elite Trainer Box",
  "Stellar Crown Booster Box",
  "Stellar Crown Elite Trainer Box -center",
  "Stellar Crown Pokemon Center Elite Trainer Box",
  "Surging Sparks Booster Box",
  "Surging Sparks Elite Trainer Box -center",
  "Surging Sparks Elite Pokemon Center Trainer Box",
  "Prismatic Evolutions Elite Trainer Box -center",
  "Prismatic Evolutions Pokemon Center Elite Trainer Box",
  "Journey Together Booster Box",
  "Journey Together Elite Trainer Box -center",
  "Journey Together Pokemon Center Elite Trainer Box",
];

items.forEach((item) => {
  saveItems(item)
    .then((res) => console.log(`Saved ${item}`))
    .catch(console.error);
});
