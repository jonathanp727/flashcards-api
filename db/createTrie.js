// https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-materialized-paths/
import MongoClient from '../lib/MongoClient';

MongoClient.connectToServer(async (err, db) => {
  if (err) throw err;

  try {
    await createCollection(db);
    var dict = await getDict(db);
  } catch(e) {
    throw e;
  }

  for (let i = 0; i < dict.length; i++) {
    const entry = dict[i];

    async function handleReading(r) {
      try {
        const newEntry = {
          $push: { words: entry._id },
          $setOnInsert: {
            path: r,
          },
        };

        await insert(db, r, newEntry);
      } catch(e) {
        throw e;
      }  
    }

    // Insert links to word from every possible reading
    if (entry.k_ele) {
      for (let j = 0; j < entry.k_ele.length; j++) {
        await handleReading(entry.k_ele[j].keb);
      }
    }
    for (let j = 0; j < entry.r_ele.length; j++) {
      await handleReading(entry.r_ele[j].reb);
    }

  }
  console.log('Done.');
  process.exit(0);
});

const createCollection = (db) => (
  new Promise((resolve, reject) => {
    db.collection('lookup-trie').createIndex({ path: 1 }, { unique: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
)

const getDict = (db) => (
  new Promise((resolve, reject) => {
    db.collection('dictionary').find().toArray((err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  })
);

const insert = (db, path, data) => (
  new Promise((resolve, reject) => {
    db.collection('lookup-trie').updateOne({ path }, data, { upsert: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
);
