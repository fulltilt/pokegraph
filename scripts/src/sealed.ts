import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "../generated/prisma";
import * as cheerio from "cheerio";
import { sealedProductNames } from "@pokemon/shared/src/constants";
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

  if (!res.ok) {
    throw new Error(
      `Failed to fetch eBay results for ${product}: ${res.status}`
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const items: SoldItem[] = [];

  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  $("ul.srp-results li[data-listingid]").each((_, li) => {
    // Title
    const title = $(li)
      .find(".s-card__title .su-styled-text.primary")
      .text()
      .trim();

    // Price
    const priceText = $(li).find(".s-card__price").text().trim();

    // Delivery fee (find row containing "delivery")
    const deliveryText = $(li)
      .find(".s-card__attribute-row .su-styled-text.secondary.large")
      .filter((i, el) => $(el).text().includes("delivery"))
      .text()
      .trim();

    // Sold date
    const soldAt = new Date($(li).find(".s-card__caption span").text().trim());

    // make sure date is valid and if so that it's within the last 24 hours
    if (isNaN(soldAt.getTime()) || soldAt < cutoff) return;

    // URL (use the main image link)
    const url = $(li).find("a.s-card__link.image-treatment").attr("href") || "";

    // Parse numbers
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
    const delivery = parseFloat(deliveryText.replace(/[^0-9.]/g, "")) || 0;

    if (
      title === "Shop on eBay" ||
      !title ||
      !priceText ||
      !url ||
      !priceText ||
      !isListingClean(title)
    )
      return;

    items.push({
      title,
      price: price + delivery,
      url,
      soldAt,
    });
  });

  return items;
}

async function saveItems(product: string) {
  const query = `${product} -japanese -korean -half -case -set -codes -psa -case`;
  const items = await getLastSolds(query, product);
  console.log(`Processing ${product}: ${items.length} listings found`);
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let i = 0;
sealedProductNames.forEach(async (item) => {
  saveItems(item)
    .then(() => console.log(`Saved ${item}`))
    .catch(console.error);
  ++i;
  if (i % 40 === 0) await sleep(1000);
});
