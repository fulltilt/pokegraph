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
  async function fetchAndSaveData(apiUrl) {
    try {
      // Make GET request to API
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "X-Api-Key": "e5f992bc-7cb1-45ff-978c-8083c73a3fb8",
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
  let apiUrl = `https://api.pokemontcg.io/v2/sets`;

  // Call function to fetch data and save to file
  fetchAndSaveData(apiUrl);
});

promise
  .then((res) =>
    fs.writeFileSync("sets.json", JSON.stringify(res, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File written successfully");
    })
  )
  .catch((err) => console.log(err));
