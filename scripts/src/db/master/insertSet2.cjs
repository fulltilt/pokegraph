const { Client } = require("pg");

const DB_URL = "";

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
  const set = "rsv10pt5";
  let apiUrl = `https://api.pokemontcg.io/v2/cards?q=set.id:${set}`;

  // Call function to fetch data and save to file
  fetchAndSaveData(apiUrl);
});

// const outputFile = "data_output2.json";

promise.then(
  async (res) => {
    console.log("Total cards in set: ", res.length);

    try {
      // Connect to the database
      await client.connect();
      console.log("Connected to the database");

      const updateValues = res.map((row) => ({
        id: row.id,
        data: row,
      }));

      // Build parameterized SQL for bulk insert
      const values = [];
      const params = [];

      updateValues.forEach((row, idx) => {
        const i = idx * 2;
        values.push(`($${i + 1}, $${i + 2})`);
        params.push(row.id, JSON.stringify(row.data));
      });

      const sql = `
        INSERT INTO "Card" (id, data)
        VALUES ${values.join(",")}
        ON CONFLICT (id) DO NOTHING
        RETURNING *
        `;

      await client.query(sql, params);
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
