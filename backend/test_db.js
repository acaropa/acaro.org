const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function checkSurveys() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const [rows] = await db.query('SELECT id, titulo, estado FROM encuestas');
  console.log(rows);
  await db.end();
}

checkSurveys();
