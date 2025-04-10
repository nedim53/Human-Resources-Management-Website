require('dotenv').config();
const { Pool } = require('pg');

// Debug za provjeru env varijabli
console.log('Database Configuration:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_SSL:', process.env.DB_SSL);

// Konfiguracija konekcije
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test konekcije
pool.connect((err, client, done) => {
  if (err) {
    console.error('❌ Greška pri povezivanju s bazom:', err.stack);
  } else {
    console.log('✅ Uspješno povezan na PostgreSQL bazu!');
    done();
  }
});

module.exports = pool;
