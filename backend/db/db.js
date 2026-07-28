const { Pool } = require("pg");
require("dotenv").config();

// Render Postgres requires SSL in production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
