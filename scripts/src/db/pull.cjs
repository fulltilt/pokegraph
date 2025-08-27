const { Client } = require("pg");
const fs = require("fs");

// Configure the database connection
const client = new Client({
  connectionString: "", // Vercel sets the DATABASE_URL environment variable (see .env)
  ssl: {
    rejectUnauthorized: false, // Only for development purposes, remove in production
  },
});

let out = [];

let promise = new Promise((resolve, reject) => {
  let count = 0;
  // Function to fetch data from API and save to a file
  async function fetchAndSaveData(apiUrl, page) {
    try {
      // Make GET request to API
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-Api-Key": "",
        },
      });

      const data = await response.json();
      out = out.concat(data.data);

      console.log(`Data for page ${page} retrieved`);
      ++count;
      if (count === 71) resolve(out);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      reject(error);
    }
  }

  // API URL to fetch data from
  for (let i = 1; i <= 72; ++i) {
    let apiUrl = `https://api.pokemontcg.io/v2/cards?select=id,set&page=${i}`;

    // Call function to fetch data and save to file
    // fetchAndSaveData(apiUrl, i);
  }
});

const outputFile = "data_output2.json";
// ["col1-SL1","sm75-40a","sm2-130a","sm75-60a","sm2-157a","sm10-182b","ecard3-H7","sm4-63a","sm35-10a","col1-SL6","col1-SL8","ecard2-H4","ecard2-H7","ecard3-H1","col1-SL4","ecard3-H9","col1-SL9","sm11-191a","sm11-206a","col1-SL7","ecard3-H3","col1-SL5","ecard2-H1","col1-SL2","sm5-153a","ecard2-H5","xyp-XY177a","sm6-113a","g1-28a","ecard2-H9","sm6-102a","tk2b-8","ecard2-103","ecard3-H2","ecard2-H15","ecard3-H8","sm10-182a","sm5-119a","sm2-19a","sm2-60a","ecard3-H4","sm6-112a","sm35-77a","bwp-BW78","sm12-143a","ecard3-H6","sm9-152a","sm10-189a","xy10-111a","dpp-DP55","tk2b-10","sm9-152b","tk2b-7","sm1-166","tk2a-7","tk2b-2","sm4-84a","tk1a-2","sm1-101a","sm2-124a","sm1-165","tk2a-9","mcd14-3","xy7-75a","tk2b-6","tk2b-5","xy2-88a","ecard2-H6","bwp-BW77","xy6-92a","xy10-105a","tk1b-10","ecard3-H5","ecard2-H3","xy10-54a","mcd15-4","sm7-10a","mcd17-1","tk1a-8","xy8-146a","mcd18-5","sm2-128a","sm3-112a","xy3-55a","xy6-77a","sm3-18a","sm10-195a","tk2a-8","sm3-116a","mcd16-9","sm3-39a","mcd16-7","mcd18-8","sm3-115a","g1-73a","sm35-68a","mcd16-10","sm2-92a","sm2-121a","mcd18-10","sm3-88a","dpp-DP54","tk2b-3","tk1a-6","tk2a-12","tk1a-5","mcd16-11","mcd14-11","mcd18-12","mcd15-12","mcd14-8","tk1b-5","tk2a-3","mcd17-12","tk1a-7","tk1b-4","mcd17-10","xyp-XY67a","mcd15-3","mcd15-2","tk1a-9","mcd14-10","xyp-XY202","sm5-125a","tk2a-2","tk1b-8","mcd14-5","mcd14-2","mcd15-7","mcd14-12","tk1b-6","mcd14-4","mcd18-11","mcd18-3","tk1b-1","mcd16-5","tk2a-6","sm1-167","sm5-122a","ecard2-H2","tk2b-12","mcd17-7","tk2b-4","mcd17-9","mcd17-4","mcd14-1","sm6-2a","ecard2-H8","mcd17-8","tk1b-7","mcd17-3","mcd16-12","mcd15-6","mcd15-8","mcd15-11","tk2b-11","mcd17-2","dp1-96","mcd16-8","mcd18-6","mcd15-10","mcd15-9","mcd18-2","mcd18-4","mcd16-6","mcd16-2","dp6-70","mcd15-5","tk1a-10","tk1b-9","sm3-92a","mcd16-3","mcd14-7","xyp-XY150a","tk1a-1","mcd14-9","tk1b-2","mcd17-5","sm3-105a","sm2-51a","mcd16-1","sv4pt5-128","tk2a-1","mcd17-11","xyp-XY200a","xyp-XY198a","mcd16-4","mcd18-1","tk2b-1","tk2a-11","sm2-21a","tk2b-9","mcd18-7","sm1-164","sm1-168","sm1-169","sm1-170","tk1b-3","sm1-171","tk1a-4","sm1-172","mcd14-6","sm2-125a","tk1a-3","smp-SM30a","tk2a-5","tk2a-4","tk2a-10","mcd17-6","mcd15-1","mcd18-9","col1-SL3"]
async function dbOp() {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database");

    // WHERE data->>'name' ILIKE '%tan%'
    const res = await client.query(`
      SELECT *
    FROM poketrades_card

    ORDER BY data->'set'->>'releaseDate' DESC, CAST(DATA->>'number' AS INTEGER)
      LIMIT 10
      `);
    console.log(res);
    // const res = await client.query(`
    // DELETE FROM poketrades_card
    // WHERE id IN ('hsp-HGSS05','g1-RC2','sm75-40a','g1-RC3','hsp-HGSS10','sm12-143a','swsh12tg-TG24','bwp-BW004','g1-RC27','xy4-24a','g1-RC8','g1-RC12','g1-RC14','g1-RC19','g1-RC18','g1-RC22','g1-RC7','hsp-HGSS18','xy4-65a','g1-28a','xy9-98b','g1-RC31','hsp-HGSS13','g1-RC16','g1-73a','g1-RC10','hsp-HGSS01','g1-RC6','g1-RC32','hsp-HGSS14','g1-RC21','g1-RC26','hsp-HGSS22','hsp-HGSS02','xy3-55a','hsp-HGSS25','pl3-SH8','g1-RC11','g1-RC30','g1-RC1','smp-SM30a','g1-RC4','g1-RC23','g1-RC13','g1-RC29','dp7-SH3','g1-RC24','g1-RC20','col1-SL10','g1-RC9','hsp-HGSS11','g1-RC17','hsp-HGSS23','sm5-122a','smp-SM103a','hsp-HGSS03','g1-RC5','dp7-SH1','hsp-HGSS15','swsh12tg-TG29','hsp-HGSS17','bwp-BW005','hsp-HGSS08','hsp-HGSS06','hsp-HGSS19','sm5-125a','swsh12tg-TG27','hsp-HGSS16','swsh12tg-TG21','sm5-153a','g1-RC15','smp-SM104a','sm5-119a','swsh12tg-TG19','g1-RC28','swsh12tg-TG25','hsp-HGSS07','dp7-SH2','g1-RC25','sm75-60a')
    //         `);
    // const res = await client.query(`
    // SELECT *
    //   FROM poketrades_card
    //  WHERE id = 'sm3-115a'
    // `);
    // ORDER BY (data->'set'->>'releaseDate')::date DESC
    // console.log(res.rows.map((x) => x.id));
    // fs.writeFile(
    //   "output.json",
    //   JSON.stringify(res.rows.map((x) => x.id)),
    //   (err) => {
    //     if (err) {
    //       console.error("Error writing file:", err);
    //     } else {
    //       console.log("File written successfully");
    //     }
    //   }
    // );
    // SELECT *
    //   FROM poketrades_card
    //   WHERE data->'set'->>'id' = 'sv6'

    // SELECT *
    //   FROM poketrades_card
    //   WHERE data->>'number' = 'sm75-40a'

    // this gets the f'd up data
    // SELECT *
    // FROM poketrades_card
    //   ORDER BY (data->'set'->>'releaseDate')::date DESC
    //   LIMIT 30

    // SELECT *
    //   FROM poketrades_card
    //   WHERE id

    // releaseDate shows when ordering by non-existent field but if I put an existing field, I get null

    // WHERE (data ->> 'number')::text ILIKE 'sh8'
    // console.log(JSON.stringify(res.rows));
  } catch (err) {
    console.error("Error connecting to the database", err);
  } finally {
    // Close the client connection
    await client.end();
    console.log("Disconnected from the database");
  }
}

dbOp();
