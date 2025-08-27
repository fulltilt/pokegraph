const { Client } = require("pg");
const fs = require("fs");

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
  const set = "sv9";
  let apiUrl = `https://api.pokemontcg.io/v2/cards?q=set.id:${set}&page=1`;

  // Call function to fetch data and save to file
  fetchAndSaveData(apiUrl);
});

const outputFile = "data_output2.json";

// promise.then(
//   async (res) => {
//     console.log(res.length);

//     fs.writeFileSync(outputFile, JSON.stringify(res, null, 2), (err) => {
//       if (err) {
//         console.error(err);
//         return;
//       }
//       console.log("File written successfully");
//     });

async function insertSet() {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database");

    const fileContents = fs.readFileSync(outputFile, "utf-8");
    const jsonObject = JSON.parse(fileContents);

    // Create a parameterized query with multiple value sets
    const values = [];
    const placeholders = [];
    let counter = 1;

    jsonObject.forEach((card) => {
      values.push(card.id, JSON.stringify(card));
      placeholders.push(`($${counter}, $${counter + 1})`);
      counter += 2;
    });

    const query = `
      INSERT INTO poketrades_card (id, data)
      VALUES ${placeholders.join(", ")}
      RETURNING *
    `;

    const data = await client.query(query, values);

    console.log(data);
  } catch (err) {
    console.error("Error connecting to the database", err);
  } finally {
    // Close the client connection
    await client.end();
    console.log("Disconnected from the database");
  }
  //   },
  //   (err) => console.log(err)
  // );
}

insertSet();
