import { prisma } from "@pokemon/shared";
import { Sealed } from "../types";
import { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { pipeline as hfPipeline } from "@xenova/transformers";

export async function getAllSealedProducts(): Promise<any[]> {
  try {
    const sealed = await prisma.sealed.findMany();
    return sealed;
  } catch (error) {
    console.error("Error fetching sealed products:", error);
    return [];
  }
}

export async function getSealedByTitle(title: string): Promise<Sealed | null> {
  try {
    const sealed = await prisma.sealed.findFirst({
      where: {
        product: {
          equals: title,
          mode: "insensitive", // makes the match case-insensitive. Can't use findUnique
        },
      },
      include: {
        prices: {
          where: {
            label: "keep",
          },
          orderBy: {
            soldAt: "asc",
          },
        },
      },
    });

    if (!sealed) {
      return null;
    }

    return sealed;
  } catch (error) {
    console.error("Error fetching sealed product by title:", error);
    return null;
  }
}

export async function getUnlabledSealedProduct(): Promise<any[]> {
  try {
    const entries = await prisma.sealedPriceEntry.findMany({
      where: { label: null },
      include: {
        sealed: {
          select: { product: true },
        },
      },
      take: 100, // optional: limit for performance
      orderBy: { soldAt: "desc" },
    });

    return entries;
  } catch (error) {
    console.error("Error fetching unlabeled sealed product", error);
    return [];
  }
}

export async function labelSealedProduct(
  id: string,
  label: string
): Promise<void> {
  try {
    await prisma.sealedPriceEntry.update({
      where: { id },
      data: { label },
    });

    return;
  } catch (error) {
    console.error(`Error labeling entry ID ${id}:`, error);
    throw new Error("Failed to update price entry label in database.");
  }
}

export type SealedPriceEntryWithSealed = Prisma.SealedPriceEntryGetPayload<{
  include: { sealed: true };
}>;

export type SealedPredictionResult = {
  items: SealedPriceEntryWithSealed[];
  total: number;
};

export async function getPredictionsForSealedProducts(
  label: string,
  where: Prisma.SealedPriceEntryWhereInput,
  search: string,
  page: number,
  perPage: number
): Promise<SealedPredictionResult | undefined> {
  const finalWhere: Prisma.SealedPriceEntryWhereInput = { ...where };

  try {
    if (label) finalWhere.label = label;
    if (search)
      finalWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { sealed: { product: { contains: search, mode: "insensitive" } } },
      ];

    const items = await prisma.sealedPriceEntry.findMany({
      where: finalWhere,
      include: { sealed: true },
      orderBy: { soldAt: "desc" },
      skip: (+page - 1) * +perPage,
      take: +perPage,
    });

    const total = await prisma.sealedPriceEntry.count({ where: finalWhere });

    return {
      items: items as SealedPriceEntryWithSealed[],
      total,
    };
  } catch (error) {
    console.error("Error fetching predictions for sealed products:", error);
    // If the function fails, it should typically return undefined or throw,
    // depending on the caller's expected error handling.
    return undefined;
  }
}

export function getUnlabeledEntries() {
  return prisma.sealedPriceEntry.findMany({
    where: { label: null },
    include: { sealed: true },
  });
}

export async function updateLabeledEntries(
  updates: { id: string; label: string }[]
) {
  if (!updates.length) return;

  const tx = updates.map((u) =>
    prisma.sealedPriceEntry.update({
      where: { id: u.id },
      data: { label: u.label },
    })
  );

  await prisma.$transaction(tx);
}

export async function classifyText(text: string) {
  const [result] = await classifierFn(text);

  return {
    prediction: result.label.toLowerCase(), // "keep" or "remove"
    confidence: result.score,
  };
}

let classifierFn: any;
export async function loadModel() {
  if (!classifierFn) {
    // const modelDir = path.resolve(__dirname, "../../trainer/model"); // Adjust if needed
    const modelDir = `file://${path.resolve(
      __dirname,
      "../../../trainer/model"
    )}`;
    console.log("Loading model from:", modelDir);
    console.log(
      "Files:",
      fs.readdirSync(path.resolve(__dirname, "../../../trainer/model"))
    );

    classifierFn = await hfPipeline("text-classification", modelDir, {
      local_files_only: true, // ⬅️ Tells Xenova to load from local dir
    });
  }
}

// let modelLoaded = false;
// let classifierFn: any;

// export async function loadModel() {
//   if (modelLoaded) return;

//   // however you load your classifier:
//   classifierFn = classifier;
//   modelLoaded = true;
// }
