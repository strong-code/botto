const pgp = require('pg-promise')();
const _config = require('./../config.js').db;
const config = {
  user: _config.username,
  database: 'botto',
  password: _config.password,
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

const db = pgp(config)

module.exports = db

/*
 * This is intended to be a private command that can be used to set up the
 * postgres database with the schema definition supplied in db/schema.sql
 * It should only be run on a new botto install. All updates/migrations/notes
 * should be detailed in the schema definition file and should be considered
 * the 'gold standard'.
 */
function _initDatabase() {
  var fs = require('fs');
  var schema = fs.readfileSync('../db/migrations/schema.sql');

  client.connect(function(err) {
    if (err) {
      return console.error('Could not connect to postgres', err);
    }
    client.query(schema, function(err, result) {
      if (err) {
        return console.error('Error executing SQL query', err);
      }
      console.log('Schema successfully created!');
      client.end();
    });
  });
}
