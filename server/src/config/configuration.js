const dotenv = require('dotenv')
dotenv.config()

const configuration = {
    version: '/api/v1',
    MONGOURI: process.env.MONGOURI,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    isLog: process.env.IS_LOG === "true" || process.env.IS_LOG === "1",
    CORS_ORIGIN: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : ["http://localhost:5173"],
}

module.exports = configuration