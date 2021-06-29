const mysql = require('mysql2')
//require('dotenv').config()

const db = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USERNAME || 'abqarTeam',
    password: process.env.DB_PASSWORD || "12345678",
    database: 'ABQAR',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})


module.exports = db
