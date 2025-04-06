require('dotenv').config();  // Učitaj varijable iz .env datoteke

const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,  // Uzmi korisničko ime iz .env
  password: process.env.DB_PASSWORD,  // Uzmi lozinku iz .env
  host: process.env.DB_HOST,  // Uzmi host iz .env
  port: process.env.DB_PORT,  // Uzmi port iz .env
  database: process.env.DB_NAME,  // Uzmi naziv baze iz .env
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,  // Uzmi certifikat iz .env
  },
});

client.connect((err) => {
    if (err) {
      console.error('Greška pri povezivanju s bazom:', err.stack);
    } else {
      console.log('Povezano na bazu.');
    }
});

module.exports = client;
