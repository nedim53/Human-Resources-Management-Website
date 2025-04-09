require('dotenv').config();
const { Pool } = require('pg');

// Debug: Ispiši vrednosti iz .env
console.log('Database Configuration:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_SSL:', process.env.DB_SSL);

const config = {
  user: "avnadmin",
  password: "AVNS_7_60DxvYG_NaC0HZ39W",
  host: "pg-1bf47fc2-hr-projekat-1.f.aivencloud.com",
  port: 24086,
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(config);

pool.connect((err, client, done) => {
  if (err) {
    console.error('Greška pri povezivanju s bazom:', err.stack);
  } else {
    console.log('Uspješno povezan na PostgreSQL bazu!');
    done();
  }
});

module.exports = pool;
