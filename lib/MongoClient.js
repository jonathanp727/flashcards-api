import { MongoClient, ObjectId } from 'mongodb';

let db = null;

module.exports = {
  connectToServer(callback) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(global.gConfig.database.url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        db = client.db(global.gConfig.database.name);
        if (callback) {
          callback(err, db);
        }
        if (err) reject(err);
        else resolve(db);
      });
    });
  },
  getDb() {
    if (db === null) {
      throw new Error("Must connect to DB before first access");
    }
    return db;
  },
};
