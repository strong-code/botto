var pg = require('pg');

module.exports = {
  executeQuery: function(query, cb) {
    client.connect(function(err) {
      if (err) {
        return cb(err);
      }
      client.query(query, function(err, result) {
        if (err) {
          return cb(err);
        }
        cb(result);
        client.end();
      });
    });
  }
};

var dbUrl = process.env.DATABSE_URL || 'postgres://localhost:5432/botto';
var client = new pg.Client(dbUrl);

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
