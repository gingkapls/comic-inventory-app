require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.PGCONNECTIONSTRING,
});

async function main() {
  try {
    console.log('resetting');
    await client.connect();
    await client.query(`DROP VIEW IF EXISTS DeepComicDetails`);
    await client.query(`
    DROP TABLE IF EXISTS Comics, Artists, Authors, Publishers, Tags,
    Artists_Draw_Comics,
    Authors_Write_Comics,
    Publisher_Publishes_Comics,
    Comics_Tags`);
    await client.end();
    console.log('done');
  } catch (e) {
    console.error('There was an error', e);
  }
}

main();
