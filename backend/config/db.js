require('dotenv').config();

const { createPool } = require('mysql2');
//mysql2 is a Node.js library (npm package) that lets your JavaScript code talk to a MySQL database.
const mysql = require('mysql2/promise');  //promise allows await

//pool instead of mysql.createConnection() to handle multiple users efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool; //so pool can be imported elsewhere