const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "12345678",
    host: "localhost",
    port: 5432,
    database: "br1tuyhub_db"
});

module.exports = pool;