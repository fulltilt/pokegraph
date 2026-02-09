import { Client } from "pg";

// CONFIGURATION: Manually update these values
// Calculate TCG ID mapping:
// If currentIdx is 218 and startIndex is 218, tcgIdx becomes 0.
const START_IDX = 1;
const SET_DATA_URL = "https://api.tcgdex.net/v2/en/sets/me02.5";
const TCG_PLAYER_IDS = [
  "676030",
  "676031",
  "676032",
  "676033",
  "676034",
  "676035",
  "676036",
  "676037",
  "676038",
  "676039",
  "676040",
  "676041",
  "676042",
  "676043",
  "676044",
  "676045",
  "676046",
  "676047",
  "676048",
  "676049",
  "676050",
  "676051",
  "676052",
  "676053",
  "676054",
  "676055",
  "676056",
  "676057",
  "676058",
  "676059",
  "676060",
  "676061",
  "676062",
  "676063",
  "676064",
  "676065",
  "676066",
  "676067",
  "676068",
  "676069",
  "676070",
  "676071",
  "676072",
  "676073",
  "676074",
  "676075",
  "676076",
  "676077",
  "676078",
  "676079",
  "676080",
  "676081",
  "676082",
  "676083",
  "676084",
  "676085",
  "676086",
  "676087",
  "676088",
  "676089",
  "676090",
  "676091",
  "676092",
  "676093",
  "676094",
  "676095",
  "676096",
  "676097",
  "676098",
  "676099",
  "676100",
  "676101",
  "676102",
  "676103",
  "676104",
  "676105",
  "676106",
  "676107",
];
/** * Types for the New API structures
 */
interface NewCardEntry {
  id: string;
  image: string;
  localId: string;
  name: string;
}

interface NewSetData {
  id: string;
  name: string;
  logo: string;
  releaseDate: string;
  serie: { id: string; name: string };
  cardCount: { total: number; official: number };
  legal: { expanded: boolean; standard: boolean };
  cards: NewCardEntry[];
}

/**
 * TEMPORARY LOGIC: Migrates existing records to the new ID format.
 * This fetches all records and re-inserts them with the normalized ID,
 * then deletes the old record if the ID actually changed.
 * Run the migration once before new inserts: await migrateExistingRecords(client);
 */
// async function migrateExistingRecords(client: Client) {
//   console.log("Starting ID migration for 'me02' records...");

//   // Only fetch records where the ID starts with 'me02'
//   const { rows } = await client.query(`
//     SELECT id, data, "tcgPlayerId"
//     FROM "Card"
//     WHERE id LIKE 'me02-%'
//   `);

//   for (const row of rows) {
//     const newId = normalizeId(row.id);
//     if (newId !== row.id) {
//       console.log(`Migrating ${row.id} -> ${newId}`);

//       // Upsert with new ID
//       await client.query(
//         `
//         INSERT INTO "Card" (id, data, "tcgPlayerId")
//         VALUES ($1, $2, $3)
//         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, "tcgPlayerId" = EXCLUDED."tcgPlayerId"
//       `,
//         [newId, row.data, row.tcgPlayerId],
//       );

//       // Delete old ID record
//       await client.query('DELETE FROM "Card" WHERE id = $1', [row.id]);
//     }
//   }
//   console.log("Migration for 'me02' complete.");
// }

/**
 * Normalizes IDs by removing leading zeros from hyphenated segments.
 * Example: "me01-001" -> "me1-1"
 * Example: "swsh10-023" -> "swsh10-23"
 */
function normalizeId(id: string): string {
  if (!id) return id;
  return id
    .split("-")
    .map((part) => {
      // Matches letters at start, then strips all leading zeros from the numeric part
      // Example: "me02" -> "me2", "001" -> "1"
      return part.replace(/^([a-zA-Z]*)0+/, "$1");
    })
    .join("-");
}

/**
 * Normalizes and inserts cards into the DB
 */
async function processAndInsertCards(
  setData: NewSetData,
  tcgIds: string[],
  startIndex: number = 0,
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const cardsToInsert = setData.cards.map((card, currentIdx) => {
      // Calculate TCG ID mapping:
      // If currentIdx is 218 and startIndex is 218, tcgIdx becomes 0.
      let tcgPlayerId: string | null = null;

      if (currentIdx >= startIndex) {
        const tcgIdx = currentIdx - startIndex;
        // Map the ID if we are within the bounds of the provided TCG ID array
        if (tcgIdx < tcgIds.length) {
          tcgPlayerId = tcgIds[tcgIdx];
        }
      }

      const normalizedId = normalizeId(card.id);
      const formatLegality = (isLegal: boolean) =>
        isLegal ? "Legal" : "Not Legal";

      const normalizedData = {
        id: normalizedId,
        name: card.name,
        number: card.localId,
        set: {
          id: setData.id,
          name: setData.name,
          total: setData.cardCount.total,
          series: setData.serie.name,
          images: {
            logo: `${setData.logo}.png`,
            symbol: `${setData.logo}.png`,
          },
          releaseDate: setData.releaseDate,
          legalities: {
            expanded: formatLegality(setData.legal.expanded),
            standard: formatLegality(setData.legal.standard),
            unlimited: "Legal",
          },
          printedTotal: setData.cardCount.official,
        },
        images: {
          small: `${card.image}/low.png`,
          large: `${card.image}/high.png`,
        },
        legalities: {
          expanded: formatLegality(setData.legal.expanded),
          standard: formatLegality(setData.legal.standard),
          unlimited: "Legal",
        },
      };

      return {
        id: normalizedId,
        data: JSON.stringify(normalizedData),
        tcgPlayerId: tcgPlayerId,
      };
    });

    await client.query("BEGIN");

    for (const card of cardsToInsert) {
      const query = `
        INSERT INTO "Card" (id, data, "tcgPlayerId")
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE 
        SET 
          data = EXCLUDED.data,
          "tcgPlayerId" = EXCLUDED."tcgPlayerId"
        RETURNING id;
      `;
      await client.query(query, [card.id, card.data, card.tcgPlayerId]);
    }

    await client.query("COMMIT");
    console.log(
      `Successfully processed ${cardsToInsert.length} cards. TCG mapping started at index ${startIndex}.`,
    );
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Error during database operations:", err);
  } finally {
    await client.end();
  }
}

/**
 * Main Execution Block
 */
async function main() {
  try {
    console.log(`Fetching set data from: ${SET_DATA_URL}`);
    const response = await fetch(SET_DATA_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch set data: ${response.statusText}`);
    }

    const setData = (await response.json()) as NewSetData;
    console.log(`Successfully fetched set: ${setData.name}`);

    // Call the processing function
    await processAndInsertCards(setData, TCG_PLAYER_IDS, START_IDX);
  } catch (error) {
    console.error("Main execution failed:", error);
  }
}

// Run the script
main();
