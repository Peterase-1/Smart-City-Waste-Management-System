const { Pool } = require('pg');

// Simple database configuration for beginners
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'waste_management',
  password: 'password', // Change this to your PostgreSQL password
  port: 5432,
});

// Simple query function
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
};

module.exports = { query };
