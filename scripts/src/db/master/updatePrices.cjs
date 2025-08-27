/*
-at each new set release, insert set data into db
-once set data is in db, call update prices which will only query for the id and the tcgplayer price data
*/

const { Client } = require("pg");

// Configure the database connection
const client = new Client({
  connectionString: "", // Vercel sets the DATABASE_URL environment variable
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
      if (count === 20) resolve(out);
    } catch (error) {
      console.log(count, apiUrl, error);
      console.error(`Error occurred: ${error.message}`);
      reject(error);
    }
  }

  // API URL to fetch data from
  for (let i = 71; i <= 90; ++i) {
    let apiUrl = `https://api.pokemontcg.io/v2/cards?select=id,tcgplayer&page=${i}`;

    // Call function to fetch data and save to file
    fetchAndSaveData(apiUrl, i);
  }
});

const outputFile = "data_output2.json";

promise.then(
  async (res) => {
    console.log(res.length);

    try {
      // Connect to the database
      await client.connect();
      console.log("Connected to the database");

      // need to filter out rows that don't have a tcgplayer field
      const updateValues = JSON.stringify(
        res
          .filter((row) => row.tcgplayer !== undefined)
          .map((row) => ({
            id: row.id,
            tcgplayer: row.tcgplayer,
          }))
      );
      // 17292
      console.log(updateValues.length);

      const data = await client.query(`UPDATE poketrades_card
            SET
               data = jsonb_set(
                   data, '{tcgplayer}', (j.elem->'tcgplayer')::jsonb, TRUE
               )
           FROM jsonb_array_elements('${updateValues}') as j(elem)
           WHERE (DATA ->> 'id')::text = (j.elem->>'id')::text
           RETURNING *`);
      console.log(data);
    } catch (err) {
      console.error("Error connecting to the database", err);
    } finally {
      // Close the client connection
      await client.end();
      console.log("Disconnected from the database");
    }
  },
  (err) => console.log(err)
);
