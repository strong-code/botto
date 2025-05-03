const pgp = require('pg-promise')()
const _config = require('./../config.js').db
const config = {
  user: _config.username,
  database: 'botto',
  password: _config.password,
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
}

if (process.env.DB_HOST) {
  config.host = process.env.DB_HOST
}

const db = pgp(config)

module.exports = db
