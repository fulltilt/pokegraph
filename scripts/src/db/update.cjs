const { Client } = require("pg");
const fs = require("fs");

// Configure the database connection
const client = new Client({
  connectionString:
    "postgres://default:t8fkzQ7rqAgE@ep-crimson-unit-a62twnxk-pooler.us-west-2.aws.neon.tech:5432/verceldb?sslmode=require", // Vercel sets the DATABASE_URL environment variable
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
          "X-Api-Key": "604db011-43f2-406f-bc0f-85332c0f950c",
        },
      });

      const data = await response.json();
      out = out.concat(data.data);

      console.log(`Data for page ${page} retrieved`);
      ++count;
      if (count === 1) resolve(out);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      reject(error);
    }
  }

  // API URL to fetch data from
  for (let i = 1; i <= 1; ++i) {
    let apiUrl = `https://api.pokemontcg.io/v2/cards?q=id:xy10-43a`;

    // Call function to fetch data and save to file
    fetchAndSaveData(apiUrl, i);
  }
});

promise.then(
  async (res) => {
    console.log(res);

    try {
      // Connect to the database
      await client.connect();
      console.log("Connected to the database");

      fs.writeFile("output.json", JSON.stringify(res), (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File written successfully");
        }
      });

      // const updateValues = JSON.stringify(
      //   res.slice(0, 1).map((update) => ({
      //     id: update.id,
      //     set: update.set,
      //   }))
      // );

      // const data = await client.query(`UPDATE poketrades_card
      //       SET
      //          data = jsonb_set(
      //              data, '{set}', (j.elem->'set')::jsonb
      //          )
      //      FROM jsonb_array_elements('${updateValues}') as j(elem)
      //      WHERE (data ->> 'id')::text = (j.elem->>'id')::text
      //      RETURNING *`);
      // console.log(data);
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
