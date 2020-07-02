const pg = require('pg');
const _config = require('./../config.js').db;

module.exports = {
  
  executeQuery: function (queryString, cb) {
    pool.connect((err, client, release) => {
      if (err) {
        console.error('Error connecting to postgres', err);
        return cb(err);
      }

      client.query(queryString, (err, result) => {
        release();

        if (err) {
          return cb(err);
        }

        return cb(result);
      });
    });
  }

};

const config = {
  user: _config.username,
  database: 'botto',
  password: _config.password,
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config);

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
