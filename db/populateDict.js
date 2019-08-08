import JHProtoMongoClient from './JHProtoMongoClient';
import MongoClient from '../lib/MongoClient';

JHProtoMongoClient.connectToServer((err, protoDb) => {  
  if (err) throw err;

  MongoClient.connectToServer(async (err, newDb) => {
    if (err) throw err;

    try {
      var protoDict = await getDict(protoDb);
    } catch(e) {
      throw e;
    }

    for (let i = 0; i < protoDict.length; i++) {
      const entry = protoDict[i];
      const newId = parseInt(entry.ent_seq);

      delete entry.sentences;
      delete entry.ent_seq;

      // Get rid of obj vs array ambiguity
      if (entry.k_ele !== undefined && !Array.isArray(entry.k_ele)) {
        entry.k_ele = [entry.k_ele];
      }
      if (entry.r_ele !== undefined && !Array.isArray(entry.r_ele)) {
        entry.r_ele = [entry.r_ele];
      }
      if (!Array.isArray(entry.sense)) {
        entry.sense = [entry.sense];
      }
      for (let i = 0; i < entry.sense.length; i++) {
        if (!Array.isArray(entry.sense[i].gloss)) {
          entry.sense[i].gloss = [entry.sense[i].gloss];
        }
      }

      const newEntry = {
        ...entry,
        _id: newId,
      };

      try {
        await insert(newDb, newEntry);
      } catch(e) {
        throw e;
      }

    }
    console.log('Done.');
    process.exit(0);
  });
});

const getDict = (db) => (
  new Promise((resolve, reject) => {
    db.collection('dictionary').find().toArray((err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  })
);

const insert = (db, data) => (
  new Promise((resolve, reject) => {
    db.collection('dictionary').insertOne(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
);
