// run script every day at 8am
// 0 8 * * * /usr/bin/node /path/to/your/ebayFetcher.js >> /tmp/ebay.log 2>&1

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let i = 0;
sealedProductNames.forEach((item) => {
  saveItems(item)
    .then(() => console.log(`Saved ${item}`))
    .catch(console.error);
  ++i;
  if (i % 40 === 0) sleep(1000);
});
