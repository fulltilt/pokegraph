// Import the pg library
const { Client } = require("pg");

// Configure the database connection
const client = new Client({
  connectionString: "", // Vercel sets the DATABASE_URL environment variable
  ssl: {
    rejectUnauthorized: false, // Only for development purposes, remove in production
  },
});

async function connectToDatabase() {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database");

    // const data = [];

    // const updateValues = JSON.stringify(
    //   data.map((update) => ({
    //     id: update.id,
    //     tcgplayer: update.tcgplayer,
    //   }))
    // );

    // console.log(`UPDATE poketrades_card
    //     SET
    //        data = jsonb_set(
    //            data, '{tcgplayer}', (j.elem->'tcgplayer')::jsonb
    //        )
    //    FROM jsonb_array_elements('${updateValues}') as j(elem)
    //    WHERE (DATA ->> 'id')::text = (j.elem->>'id')::text
    //    RETURNING *`);
    // { id: 'sv6pt5-1', data: [Object], price: 0.24 },
    // { id: 'sv6pt5-1', data: [Object], price: 0.19 },
    // { id: 'sv6pt5-10', data: [Object], price: 0.09 },
    // { id: 'sv6pt5-10', data: [Object], price: 0.17 },
    // SELECT poketrades_card.id, jsonb_path_query_array(data, '$.tcgplayer.prices.*.market') AS price

    //     SELECT  id, data, price
    // FROM (
    //       SELECT distinct on (id) id, data, jsonb_path_query(data, '$.tcgplayer.prices.*.market') AS price
    //       FROM poketrades_card
    //       WHERE poketrades_card.id ILIKE '%sv6pt5%'
    //       )
    // ORDER BY price asc

    //     select jsonb_agg(row_to_json(t)) resulting_json
    //         from (
    //         with jsonb_data as (
    //             select jsonb_array_elements(data_field) df
    //             from poketrades_card
    //         )
    // select
    //     df ->> 'id' id,
    //     max(jsonb_path_query_first(df, '$.**{4}')::integer)
    //     over (partition by df -> 'id') price
    // from jsonb_data
    // order by 2 desc) t
    // https://stackoverflow.com/questions/78836069/sorting-on-a-nested-field-in-a-jsonb-object-whose-parent-key-can-be-multiple-val?noredirect=1#comment138994079_78836069
    const res = await client.query(`
      select jsonb_agg(to_jsonb(subquery) order by price desc)
        from(select distinct on(id)id
           ,jsonb_path_query(data,'$.tcgplayer.prices.*.market') as price
     from poketrades_card 
     where data @? '$.tcgplayer.prices.*.market'
     order by id,price desc)as subquery;
     
        `);
    console.log(res.rows[0]);
  } catch (err) {
    console.error("Error connecting to the database", err);
  } finally {
    // Close the client connection
    await client.end();
    console.log("Disconnected from the database");
  }
}

// Call the connectToDatabase function
connectToDatabase();
