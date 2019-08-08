import { MongoClient } from 'mongodb';

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'jisho-history';
let db;

module.exports = {
  connectToServer(callback) {
    MongoClient.connect(DB_URL, { useNewUrlParser: true }, (err, client) => {
      db = client.db(DB_NAME);
      return callback(err, db);
    });
  },

  getDb() {
    return db;
  },
};
