const { Client } = require("pg");

const DB_URL = "";
// const DB_URL =
//   "postgres://default:t8fkzQ7rqAgE@ep-crimson-unit-a62twnxk-pooler.us-west-2.aws.neon.tech:5432/verceldb?sslmode=require"; // Vercel sets the DATABASE_URL environment variable
// Configure the database connection
const client = new Client({
  connectionString: DB_URL,
  // ssl: {
  //   rejectUnauthorized: false, // Only for development purposes, remove in production
  // },
});

let out = [];

let promise = new Promise((resolve, reject) => {
  let count = 0;
  // Function to fetch data from API and save to a file
  async function fetchAndSaveData(apiUrl) {
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

      resolve(out);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      reject(error);
    }
  }

  // API URL to fetch data from
  const set = "sv10";
  let apiUrl = `https://api.pokemontcg.io/v2/cards?q=set.id:${set}`;

  // Call function to fetch data and save to file
  fetchAndSaveData(apiUrl);
});

// const outputFile = "data_output2.json";

promise.then(
  async (res) => {
    // console.log(res);

    try {
      // Connect to the database
      await client.connect();
      console.log("Connected to the database");

      // need to filter out rows that don't have a tcgplayer field
      const updateValues = [res[0]].map((row) => ({
        id: `${row.id}::text`,
        data: `${JSON.stringify(row)}::jsonb`,
      }));

      console.log(updateValues);

      const data = await client.query(`
                INSERT INTO poketrades_card (id, data)
                VALUES (${updateValues[0]})
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
