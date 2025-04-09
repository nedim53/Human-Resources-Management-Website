require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

client.connect()
  .then(() => {
    console.log('✅ Uspješno povezan na bazu!');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Neuspješno povezivanje:', err);
  });
